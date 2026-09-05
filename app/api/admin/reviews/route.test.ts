import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  review: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  artisanProfile: { update: vi.fn() },
  adminAuditLog: { create: vi.fn() },
  adminAlert: { create: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET, PATCH } from "./route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/reviews", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("/api/admin/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.adminAuditLog.create.mockResolvedValue({})
    prismaMock.adminAlert.create.mockResolvedValue({})
  })

  it("GET returns 403 for non-admins", async () => {
    authMock.mockResolvedValue({ userId: "u1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", role: "CUSTOMER" })
    const res = await GET(new Request("http://localhost/api/admin/reviews?flagged=true"))
    expect(res.status).toBe(403)
  })

  it("GET lists flagged reviews for an admin", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.review.findMany.mockResolvedValue([])

    const res = await GET(new Request("http://localhost/api/admin/reviews?flagged=true"))
    expect(res.status).toBe(200)
    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ flagged: true, removedAt: null }),
      })
    )
  })

  it("PATCH flags a review", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.review.findUnique.mockResolvedValue({ id: "r1", artisanId: "ap_1", rating: 2, removedAt: null })
    prismaMock.review.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ reviewId: "r1", action: "flag" }))
    expect(res.status).toBe(200)
    expect(prismaMock.review.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { flagged: true },
    })
  })

  it("PATCH removes a review and recalculates rating", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.review.findUnique.mockResolvedValue({ id: "r1", artisanId: "ap_1", rating: 1, removedAt: null })
    prismaMock.review.update.mockResolvedValue({})
    prismaMock.review.findMany.mockResolvedValue([{ rating: 5 }])
    prismaMock.artisanProfile.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ reviewId: "r1", action: "remove" }))
    expect(res.status).toBe(200)
    expect(prismaMock.artisanProfile.update).toHaveBeenCalledWith({
      where: { id: "ap_1" },
      data: { rating: 5, totalReviews: 1 },
    })
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "REVIEW_REMOVE" }),
      })
    )
  })

  it("PATCH returns 404 for an already removed review", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.review.findUnique.mockResolvedValue({ id: "r1", removedAt: new Date() })

    const res = await PATCH(jsonRequest({ reviewId: "r1", action: "remove" }))
    expect(res.status).toBe(404)
  })
})
