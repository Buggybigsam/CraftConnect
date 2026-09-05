import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  booking: { findUnique: vi.fn(), update: vi.fn() },
  artisanProfile: { findUnique: vi.fn() },
  payment: { update: vi.fn() },
  adminAuditLog: { create: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { PATCH } from "./route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/bookings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const booking = {
  id: "b1",
  status: "CONFIRMED",
  artisanId: "ap_1",
  payment: { id: "pay_1", status: "SUCCESS", reference: "ref_1", amount: 100 },
}

describe("PATCH /api/admin/bookings", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.adminAuditLog.create.mockResolvedValue({})
    prismaMock.$transaction.mockImplementation(async (ops: unknown) => ops)
    global.fetch = vi.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue({ userId: null })
    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "cancel" }))
    expect(res.status).toBe(401)
  })

  it("returns 403 when the caller is not an admin", async () => {
    authMock.mockResolvedValue({ userId: "u1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", role: "CUSTOMER" })
    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "cancel" }))
    expect(res.status).toBe(403)
  })

  it("rejects an unknown action", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "explode" }))
    expect(res.status).toBe(400)
  })

  it("cancels an open booking and writes an audit log", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.booking.findUnique.mockResolvedValue(booking)
    prismaMock.booking.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "cancel" }))

    expect(res.status).toBe(200)
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: "b1" },
      data: { status: "CANCELLED" },
    })
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "BOOKING_CANCEL", targetId: "b1" }),
      })
    )
  })

  it("does not cancel a completed booking", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.booking.findUnique.mockResolvedValue({ ...booking, status: "COMPLETED" })

    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "cancel" }))
    expect(res.status).toBe(409)
  })

  it("refunds a successful payment via Paystack", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.booking.findUnique.mockResolvedValue(booking)
    process.env.PAYSTACK_SECRET_KEY = "sk_test"
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ status: true }),
    })

    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "refund" }))

    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paystack.co/refund",
      expect.objectContaining({ method: "POST" })
    )
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "BOOKING_REFUND" }),
      })
    )
  })

  it("returns 502 when Paystack refund fails", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.booking.findUnique.mockResolvedValue(booking)
    process.env.PAYSTACK_SECRET_KEY = "sk_test"
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ status: false, message: "insufficient" }),
    })

    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "refund" }))
    expect(res.status).toBe(502)
  })

  it("reassigns a booking to an approved artisan", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.booking.findUnique.mockResolvedValue(booking)
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "ap_2", status: "APPROVED" })
    prismaMock.booking.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "reassign", artisanId: "ap_2" }))

    expect(res.status).toBe(200)
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: "b1" },
      data: { artisanId: "ap_2" },
    })
  })

  it("returns 404 when the target artisan is not approved", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.booking.findUnique.mockResolvedValue(booking)
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "ap_2", status: "PENDING" })

    const res = await PATCH(jsonRequest({ bookingId: "b1", action: "reassign", artisanId: "ap_2" }))
    expect(res.status).toBe(404)
  })
})
