import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())

const prismaMock = vi.hoisted(() => ({
  booking: { findFirst: vi.fn() },
  artisanProfile: { findUnique: vi.fn(), update: vi.fn() },
  review: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { POST } from "./route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock)
    )
  })

  it("returns 401 when the caller is not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null })

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 5 }))

    expect(res.status).toBe(401)
  })

  it("rejects a rating below 1", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 0 }))

    expect(res.status).toBe(400)
    expect(prismaMock.booking.findFirst).not.toHaveBeenCalled()
  })

  it("rejects a rating above 5", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 6 }))

    expect(res.status).toBe(400)
  })

  it("returns 404 when no completed booking matches the customer", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.booking.findFirst.mockResolvedValue(null)

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 5 }))

    expect(res.status).toBe(404)
    expect(prismaMock.review.create).not.toHaveBeenCalled()
  })

  it("returns 404 when the artisan profile doesn't exist", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.booking.findFirst.mockResolvedValue({ id: "booking_1", customerId: "cust_1", status: "COMPLETED" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue(null)

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 5 }))

    expect(res.status).toBe(404)
    expect(prismaMock.review.create).not.toHaveBeenCalled()
  })

  it("returns 409 and does not create a duplicate when the booking is already reviewed", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.booking.findFirst.mockResolvedValue({ id: "booking_1", customerId: "cust_1", status: "COMPLETED" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "artisan_1" })
    prismaMock.review.findUnique.mockResolvedValue({ id: "existing_review", bookingId: "booking_1" })

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 5 }))

    expect(res.status).toBe(409)
    expect(prismaMock.review.create).not.toHaveBeenCalled()
  })

  it("creates the review and recalculates the artisan's average rating on success", async () => {
    authMock.mockResolvedValue({ userId: "cust_1" })
    prismaMock.booking.findFirst.mockResolvedValue({ id: "booking_1", customerId: "cust_1", status: "COMPLETED" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "artisan_1" })
    prismaMock.review.findUnique.mockResolvedValue(null)
    prismaMock.review.create.mockResolvedValue({ id: "review_1", rating: 4 })
    prismaMock.review.findMany.mockResolvedValue([{ rating: 5 }, { rating: 3 }, { rating: 4 }])
    prismaMock.artisanProfile.update.mockResolvedValue({})

    const res = await POST(jsonRequest({ bookingId: "booking_1", artisanUserId: "artisan_user_1", rating: 4, comment: "Great work" }))

    expect(prismaMock.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerId: "cust_1",
        artisanId: "artisan_1",
        bookingId: "booking_1",
        rating: 4,
        comment: "Great work",
      }),
    })
    expect(prismaMock.artisanProfile.update).toHaveBeenCalledWith({
      where: { id: "artisan_1" },
      data: { rating: 4, totalReviews: 3 },
    })
    expect(res.status).toBe(200)
  })
})
