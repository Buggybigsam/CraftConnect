import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())

const prismaMock = vi.hoisted(() => ({
  service: { findUnique: vi.fn() },
  booking: { create: vi.fn(), delete: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
  user: { findUnique: vi.fn() },
  payment: { create: vi.fn() },
  artisanProfile: { findUnique: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

// Prisma client isn't reachable in this test environment, mock the module boundary instead
import { POST, PATCH } from "./route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          status: true,
          data: { authorization_url: "https://paystack.test/pay", reference: "ref_123" },
        }),
      }))
    )
  })

  it("returns 401 when the caller is not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null })

    const res = await POST(jsonRequest({ serviceId: "svc_1", date: "2026-09-01" }))

    expect(res.status).toBe(401)
    expect(prismaMock.booking.create).not.toHaveBeenCalled()
  })

  it("returns 404 when the service does not exist", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.service.findUnique.mockResolvedValue(null)

    const res = await POST(jsonRequest({ serviceId: "missing", date: "2026-09-01" }))

    expect(res.status).toBe(404)
    expect(prismaMock.booking.create).not.toHaveBeenCalled()
  })

  it("creates a pending booking tied to the authenticated customer and the service's artisan", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.service.findUnique.mockResolvedValue({ id: "svc_1", artisanId: "artisan_1", price: 100 })
    prismaMock.booking.create.mockResolvedValue({ id: "booking_1", status: "PENDING" })
    prismaMock.user.findUnique.mockResolvedValue({ email: "cust@example.com" })
    prismaMock.payment.create.mockResolvedValue({})

    const res = await POST(jsonRequest({ serviceId: "svc_1", date: "2026-09-01" }))

    expect(prismaMock.booking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerId: "cust_1",
        artisanId: "artisan_1",
        serviceId: "svc_1",
        status: "PENDING",
      }),
    })
    expect(res.status).toBe(200)
  })

  it("normalizes seconds/milliseconds off the booking date so near-identical timestamps collide", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.service.findUnique.mockResolvedValue({ id: "svc_1", artisanId: "artisan_1", price: 100 })
    prismaMock.booking.create.mockResolvedValue({ id: "booking_1", status: "PENDING" })
    prismaMock.user.findUnique.mockResolvedValue({ email: "cust@example.com" })
    prismaMock.payment.create.mockResolvedValue({})

    await POST(jsonRequest({ serviceId: "svc_1", date: "2026-09-01T10:00:00.999Z" }))

    expect(prismaMock.booking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        date: new Date("2026-09-01T10:00:00.000Z"),
      }),
    })
  })

  it("returns 409 when the artisan already has a booking for that exact slot", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.service.findUnique.mockResolvedValue({ id: "svc_1", artisanId: "artisan_1", price: 100 })
    const uniqueConstraintError = Object.assign(new Error("Unique constraint failed"), { code: "P2002" })
    prismaMock.booking.create.mockRejectedValue(uniqueConstraintError)

    const res = await POST(jsonRequest({ serviceId: "svc_1", date: "2026-09-01T10:00:00.000Z" }))

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/already booked/i)
  })

  it("rolls back the booking when Paystack initialization fails", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.service.findUnique.mockResolvedValue({ id: "svc_1", artisanId: "artisan_1", price: 100 })
    prismaMock.booking.create.mockResolvedValue({ id: "booking_1", status: "PENDING" })
    prismaMock.user.findUnique.mockResolvedValue({ email: "cust@example.com" })
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ status: false }) }))
    )

    const res = await POST(jsonRequest({ serviceId: "svc_1", date: "2026-09-01" }))

    expect(prismaMock.booking.delete).toHaveBeenCalledWith({ where: { id: "booking_1" } })
    expect(res.status).toBe(500)
  })
})

describe("PATCH /api/bookings (status transitions)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when the caller is not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null })

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "CONFIRMED" }))

    expect(res.status).toBe(401)
  })

  it("rejects a status outside the allowed transition set", async () => {
    authMock.mockResolvedValue({ userId: "artisan_user_1" })

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "COMPLETED" }))

    expect(res.status).toBe(400)
    expect(prismaMock.artisanProfile.findUnique).not.toHaveBeenCalled()
  })

  it("rejects an arbitrary/unknown status value", async () => {
    authMock.mockResolvedValue({ userId: "artisan_user_1" })

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "DELETED" }))

    expect(res.status).toBe(400)
  })

  it("rejects a request with no status field", async () => {
    authMock.mockResolvedValue({ userId: "artisan_user_1" })

    const res = await PATCH(jsonRequest({ bookingId: "booking_1" }))

    expect(res.status).toBe(400)
    expect(prismaMock.artisanProfile.findUnique).not.toHaveBeenCalled()
  })

  it("returns 403 when the caller has no artisan profile", async () => {
    authMock.mockResolvedValue({ userId: "not_an_artisan" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue(null)

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "CONFIRMED" }))

    expect(res.status).toBe(403)
  })

  it("returns 404 when the booking doesn't belong to the calling artisan", async () => {
    authMock.mockResolvedValue({ userId: "artisan_user_1" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "artisan_1" })
    prismaMock.booking.findFirst.mockResolvedValue(null)

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "CONFIRMED" }))

    expect(res.status).toBe(404)
    expect(prismaMock.booking.update).not.toHaveBeenCalled()
  })

  it("returns 409 and does not update when the booking is no longer PENDING", async () => {
    authMock.mockResolvedValue({ userId: "artisan_user_1" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "artisan_1" })
    prismaMock.booking.findFirst.mockResolvedValue({ id: "booking_1", status: "CANCELLED", artisanId: "artisan_1" })
    prismaMock.booking.updateMany.mockResolvedValue({ count: 0 })

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "CONFIRMED" }))

    expect(res.status).toBe(409)
    expect(prismaMock.booking.updateMany).toHaveBeenCalledWith({
      where: { id: "booking_1", artisanId: "artisan_1", status: "PENDING" },
      data: { status: "CONFIRMED" },
    })
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled()
  })

  it("updates a PENDING booking to CONFIRMED for the owning artisan", async () => {
    authMock.mockResolvedValue({ userId: "artisan_user_1" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "artisan_1" })
    prismaMock.booking.findFirst.mockResolvedValue({ id: "booking_1", status: "PENDING", artisanId: "artisan_1" })
    prismaMock.booking.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.booking.findUnique.mockResolvedValue({ id: "booking_1", status: "CONFIRMED" })

    const res = await PATCH(jsonRequest({ bookingId: "booking_1", status: "CONFIRMED" }))

    expect(prismaMock.booking.updateMany).toHaveBeenCalledWith({
      where: { id: "booking_1", artisanId: "artisan_1", status: "PENDING" },
      data: { status: "CONFIRMED" },
    })
    expect(res.status).toBe(200)
  })
})
