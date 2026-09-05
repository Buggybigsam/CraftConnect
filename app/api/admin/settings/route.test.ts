import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  platformConfig: { upsert: vi.fn(), update: vi.fn() },
  adminAuditLog: { create: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET, PATCH } from "./route"

const config = {
  id: "default",
  platformFeePercent: 10,
  categories: ["Plumber"],
  announcementBanner: "",
}

describe("/api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.platformConfig.upsert.mockResolvedValue(config)
    prismaMock.platformConfig.update.mockResolvedValue({ ...config, platformFeePercent: 12 })
    prismaMock.adminAuditLog.create.mockResolvedValue({})
  })

  it("GET returns the singleton config for an admin", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })

    const res = await GET()
    expect(res.status).toBe(200)
  })

  it("PATCH rejects a commission rate over 100", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })

    const res = await PATCH(
      new Request("http://localhost/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ platformFeePercent: 150 }),
      })
    )
    expect(res.status).toBe(400)
  })

  it("PATCH updates commission and writes an audit log", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })

    const res = await PATCH(
      new Request("http://localhost/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ platformFeePercent: 12, announcementBanner: "Hello" }),
      })
    )
    expect(res.status).toBe(200)
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "SETTINGS_UPDATE" }),
      })
    )
  })
})
