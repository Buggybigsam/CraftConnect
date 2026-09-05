import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  artisanProfile: { update: vi.fn(), findMany: vi.fn() },
  adminAuditLog: { create: vi.fn() },
  adminAlert: { create: vi.fn() },
}))

const emailSendMock = vi.hoisted(() => vi.fn())

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

vi.mock("@/lib/email", () => ({
  email: { send: emailSendMock },
  FROM_EMAIL: "noreply@CraftConnect.test",
}))

import { PATCH, GET } from "./route"

function jsonRequest(body: unknown, ip = "127.0.0.1") {
  return new Request("http://localhost/api/admin/artisans", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  })
}

describe("PATCH /api/admin/artisans", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    emailSendMock.mockResolvedValue({})
    prismaMock.adminAuditLog.create.mockResolvedValue({})
    prismaMock.adminAlert.create.mockResolvedValue({})
  })

  it("returns 429 once the per-IP rate limit is exceeded", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockResolvedValue({
      id: "ap_1",
      status: "APPROVED",
      user: { email: "artisan@example.com", name: "Kofi" },
    })

    const ip = "198.51.100.80"
    for (let i = 0; i < 30; i++) {
      const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }, ip))
      expect(res.status).toBe(200)
    }

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }, ip))
    expect(res.status).toBe(429)
  })

  it("returns 401 when the caller is not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null })

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }))

    expect(res.status).toBe(401)
    expect(prismaMock.artisanProfile.update).not.toHaveBeenCalled()
  })

  it("returns 403 when the caller is not an admin", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", role: "CUSTOMER" })

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }))

    expect(res.status).toBe(403)
    expect(prismaMock.artisanProfile.update).not.toHaveBeenCalled()
  })

  it("returns 403 when the caller has no user record at all", async () => {
    authMock.mockResolvedValue({ userId: "ghost" })
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }))

    expect(res.status).toBe(403)
  })

  it("allows reopening an application back to PENDING", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockResolvedValue({
      id: "ap_1",
      status: "PENDING",
      user: { email: "artisan@example.com", name: "Kofi" },
    })

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "PENDING" }))

    expect(res.status).toBe(200)
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "ARTISAN_PENDING", targetId: "ap_1" }),
      })
    )
    expect(emailSendMock).not.toHaveBeenCalled()
  })

  it("rejects an arbitrary/unknown status value", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "DELETED" }))

    expect(res.status).toBe(400)
  })

  it("approves an artisan and emails an approval notice", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockResolvedValue({
      id: "ap_1",
      status: "APPROVED",
      user: { email: "artisan@example.com", name: "Kofi" },
    })

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }))

    expect(prismaMock.artisanProfile.update).toHaveBeenCalledWith({
      where: { id: "ap_1" },
      data: { status: "APPROVED" },
      include: { user: { select: { email: true, name: true } } },
    })
    expect(emailSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "artisan@example.com",
        subject: expect.stringMatching(/approved/i),
      })
    )
    expect(res.status).toBe(200)
  })

  it("rejects an artisan and emails a rejection notice", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockResolvedValue({
      id: "ap_1",
      status: "REJECTED",
      user: { email: "artisan@example.com", name: "Ama" },
    })

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "REJECTED" }))

    expect(emailSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "artisan@example.com",
        subject: expect.stringMatching(/application update/i),
      })
    )
    expect(res.status).toBe(200)
  })

  it("still succeeds when the notification email fails to send", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockResolvedValue({
      id: "ap_1",
      status: "APPROVED",
      user: { email: "artisan@example.com", name: "Kofi" },
    })
    emailSendMock.mockRejectedValue(new Error("SendGrid is down"))

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }))

    expect(res.status).toBe(200)
  })

  it("returns 404 when artisanProfileId doesn't exist", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    const notFoundError = Object.assign(new Error("Record not found"), { code: "P2025" })
    prismaMock.artisanProfile.update.mockRejectedValue(notFoundError)

    const res = await PATCH(jsonRequest({ artisanProfileId: "missing", status: "APPROVED" }))

    expect(res.status).toBe(404)
    expect(emailSendMock).not.toHaveBeenCalled()
  })

  it("propagates a non-P2025 database error instead of swallowing it", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockRejectedValue(new Error("connection lost"))

    await expect(PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }))).rejects.toThrow(
      "connection lost"
    )
  })

  it("returns 429 once the per-IP rate limit is exceeded", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.update.mockResolvedValue({
      id: "ap_1",
      status: "APPROVED",
      user: { email: "artisan@example.com", name: "Kofi" },
    })

    const ip = "203.0.113.10"
    for (let i = 0; i < 30; i++) {
      const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }, ip))
      expect(res.status).toBe(200)
    }

    const res = await PATCH(jsonRequest({ artisanProfileId: "ap_1", status: "APPROVED" }, ip))
    expect(res.status).toBe(429)
  })
})

describe("GET /api/admin/artisans", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue({ userId: null })
    const res = await GET(new Request("http://localhost/api/admin/artisans"))
    expect(res.status).toBe(401)
  })

  it("returns 403 for a non-admin", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", role: "CUSTOMER" })
    const res = await GET(new Request("http://localhost/api/admin/artisans"))
    expect(res.status).toBe(403)
  })

  it("lists artisans filtered by status", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.findMany.mockResolvedValue([])

    const res = await GET(new Request("http://localhost/api/admin/artisans?status=APPROVED"))

    expect(res.status).toBe(200)
    expect(prismaMock.artisanProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "APPROVED" },
      })
    )
  })
})
