import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  adminAlert: { findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET, PATCH } from "./route"

describe("/api/admin/alerts", () => {
  beforeEach(() => vi.clearAllMocks())

  it("GET returns unread counts for an admin", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.adminAlert.findMany.mockResolvedValue([
      { id: "a1", isRead: false },
      { id: "a2", isRead: true },
    ])

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.unreadCount).toBe(1)
  })

  it("PATCH marks a single alert read", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.adminAlert.update.mockResolvedValue({})

    const res = await PATCH(
      new Request("http://localhost/api/admin/alerts", {
        method: "PATCH",
        body: JSON.stringify({ alertId: "a1", action: "read" }),
      })
    )
    expect(res.status).toBe(200)
  })

  it("PATCH marks all alerts read", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.adminAlert.updateMany.mockResolvedValue({ count: 3 })

    const res = await PATCH(
      new Request("http://localhost/api/admin/alerts", {
        method: "PATCH",
        body: JSON.stringify({ action: "readAll" }),
      })
    )
    expect(res.status).toBe(200)
    expect(prismaMock.adminAlert.updateMany).toHaveBeenCalled()
  })
})
