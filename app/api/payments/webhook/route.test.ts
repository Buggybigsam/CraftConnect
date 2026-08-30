import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import crypto from "crypto"

const prismaMock = vi.hoisted(() => ({
  payment: { findUnique: vi.fn(), update: vi.fn() },
  booking: { update: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { POST } from "./route"

const SECRET = "test_paystack_secret"

function sign(body: string) {
  return crypto.createHmac("sha512", SECRET).update(body).digest("hex")
}

function webhookRequest(body: string, { signature, ip }: { signature?: string; ip?: string } = {}) {
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    body,
    headers: {
      "x-paystack-signature": signature ?? sign(body),
      ...(ip ? { "x-forwarded-for": ip } : {}),
    },
  })
}

describe("POST /api/payments/webhook", () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = SECRET
  })

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret
  })

  it("fails closed with 500 when PAYSTACK_SECRET_KEY is not configured, even with a matching empty-key signature", async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    const forgedSignature = crypto.createHmac("sha512", "").update(body).digest("hex")

    const res = await POST(webhookRequest(body, { signature: forgedSignature }))

    expect(res.status).toBe(500)
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled()
  })

  it("rejects a request with a missing signature", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    const res = await POST(
      new Request("http://localhost/api/payments/webhook", { method: "POST", body })
    )

    expect(res.status).toBe(401)
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled()
  })

  it("rejects a request with a tampered signature", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    const res = await POST(webhookRequest(body, { signature: sign(body + "tampered") }))

    expect(res.status).toBe(401)
  })

  it("rejects a signature computed with the wrong secret", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    const wrongSignature = crypto.createHmac("sha512", "wrong_secret").update(body).digest("hex")
    const res = await POST(webhookRequest(body, { signature: wrongSignature }))

    expect(res.status).toBe(401)
  })

  it("rejects a non-hex signature without throwing", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    const res = await POST(webhookRequest(body, { signature: "not-hex-at-all!!" }))

    expect(res.status).toBe(401)
  })

  it("rejects malformed JSON even with a valid signature", async () => {
    const body = "{not valid json"
    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(400)
  })

  it("acknowledges but ignores events other than charge.success", async () => {
    const body = JSON.stringify({ event: "charge.failed", data: { reference: "ref_1" } })
    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(200)
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled()
  })

  it("rejects a charge.success event with no reference", async () => {
    const body = JSON.stringify({ event: "charge.success", data: {} })
    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(400)
  })

  it("acknowledges without updating when the reference is unknown", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_unknown" } })
    prismaMock.payment.findUnique.mockResolvedValue(null)

    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(200)
    expect(prismaMock.payment.update).not.toHaveBeenCalled()
    expect(prismaMock.booking.update).not.toHaveBeenCalled()
  })

  it("does not reprocess a payment that is already SUCCESS (idempotent retry)", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    prismaMock.payment.findUnique.mockResolvedValue({ bookingId: "booking_1", status: "SUCCESS" })

    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(200)
    expect(prismaMock.payment.update).not.toHaveBeenCalled()
    expect(prismaMock.booking.update).not.toHaveBeenCalled()
  })

  it("marks the payment SUCCESS and confirms the booking on first delivery", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    prismaMock.payment.findUnique.mockResolvedValue({ bookingId: "booking_1", status: "PENDING" })
    prismaMock.payment.update.mockResolvedValue({})
    prismaMock.booking.update.mockResolvedValue({})

    const res = await POST(webhookRequest(body))

    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { reference: "ref_1" },
      data: expect.objectContaining({ status: "SUCCESS" }),
    })
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: "booking_1" },
      data: { status: "CONFIRMED" },
    })
    expect(res.status).toBe(200)
  })

  it("acknowledges instead of erroring when the booking behind a confirmed payment no longer exists", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    prismaMock.payment.findUnique.mockResolvedValue({ bookingId: "booking_gone", status: "PENDING" })
    prismaMock.payment.update.mockResolvedValue({})
    const notFoundError = Object.assign(new Error("Record not found"), { code: "P2025" })
    prismaMock.booking.update.mockRejectedValue(notFoundError)

    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
  })

  it("returns 500 when the database update fails after signature verification passes", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } })
    prismaMock.payment.findUnique.mockResolvedValue({ bookingId: "booking_1", status: "PENDING" })
    prismaMock.payment.update.mockRejectedValue(new Error("db down"))

    const res = await POST(webhookRequest(body))

    expect(res.status).toBe(500)
  })

  it("returns 429 once the per-IP rate limit is exceeded", async () => {
    const body = JSON.stringify({ event: "charge.failed", data: {} })
    const ip = "203.0.113.77"
    for (let i = 0; i < 30; i++) {
      const res = await POST(webhookRequest(body, { ip }))
      expect(res.status).toBe(200)
    }

    const res = await POST(webhookRequest(body, { ip }))
    expect(res.status).toBe(429)
  })
})
