import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  adminAuditLog: { count: vi.fn(), findMany: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET } from "./route"

describe("GET /api/admin/audit-log", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue({ userId: null })
    const res = await GET(new Request("http://localhost/api/admin/audit-log"))
    expect(res.status).toBe(401)
  })

  it("returns paginated logs for an admin", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.adminAuditLog.count.mockResolvedValue(1)
    prismaMock.adminAuditLog.findMany.mockResolvedValue([
      { id: "log_1", action: "USER_SUSPEND", admin: { name: "Ada" } },
    ])

    const res = await GET(new Request("http://localhost/api/admin/audit-log?action=USER_SUSPEND"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.total).toBe(1)
    expect(json.logs).toHaveLength(1)
  })
})
