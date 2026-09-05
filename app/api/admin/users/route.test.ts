import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const updateUserMetadataMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  adminAuditLog: { create: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
  clerkClient: async () => ({ users: { updateUserMetadata: updateUserMetadataMock } }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { PATCH } from "./route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("PATCH /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.adminAuditLog.create.mockResolvedValue({})
    updateUserMetadataMock.mockResolvedValue({})
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue({ userId: null })
    expect((await PATCH(jsonRequest({ userId: "u1", action: "suspend" }))).status).toBe(401)
  })

  it("returns 403 when the caller is not an admin", async () => {
    authMock.mockResolvedValue({ userId: "u1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", role: "CUSTOMER" })
    expect((await PATCH(jsonRequest({ userId: "u2", action: "suspend" }))).status).toBe(403)
  })

  it("prevents an admin from suspending themselves", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    const res = await PATCH(jsonRequest({ userId: "admin_1", action: "suspend" }))
    expect(res.status).toBe(409)
  })

  it("suspends a user and writes an audit log", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "admin_1", role: "ADMIN" })
      .mockResolvedValueOnce({ id: "u2", role: "CUSTOMER", status: "ACTIVE" })
    prismaMock.user.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ userId: "u2", action: "suspend" }))

    expect(res.status).toBe(200)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u2" },
      data: { status: "SUSPENDED" },
    })
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "USER_SUSPEND", targetId: "u2" }),
      })
    )
  })

  it("reinstates a suspended user", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "admin_1", role: "ADMIN" })
      .mockResolvedValueOnce({ id: "u2", role: "CUSTOMER", status: "SUSPENDED" })
    prismaMock.user.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ userId: "u2", action: "reinstate" }))
    expect(res.status).toBe(200)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u2" },
      data: { status: "ACTIVE" },
    })
  })

  it("rejects an invalid role", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "admin_1", role: "ADMIN" })
      .mockResolvedValueOnce({ id: "u2", role: "CUSTOMER", status: "ACTIVE" })

    const res = await PATCH(jsonRequest({ userId: "u2", action: "setRole", role: "SUPERADMIN" }))
    expect(res.status).toBe(400)
  })

  it("promotes a user to ADMIN and syncs Clerk metadata", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "admin_1", role: "ADMIN" })
      .mockResolvedValueOnce({ id: "u2", role: "CUSTOMER", status: "ACTIVE" })
    prismaMock.user.update.mockResolvedValue({})

    const res = await PATCH(jsonRequest({ userId: "u2", action: "setRole", role: "ADMIN" }))

    expect(res.status).toBe(200)
    expect(updateUserMetadataMock).toHaveBeenCalledWith("u2", {
      publicMetadata: { role: "ADMIN" },
    })
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "USER_ROLE_CHANGE" }),
      })
    )
  })
})
