import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  payment: { findMany: vi.fn() },
  artisanPayout: { findMany: vi.fn(), create: vi.fn() },
  artisanProfile: { findUnique: vi.fn() },
  adminAuditLog: { create: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET, POST } from "./route"

describe("/api/admin/payouts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.adminAuditLog.create.mockResolvedValue({})
  })

  it("GET aggregates amounts owed per artisan", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.payment.findMany.mockResolvedValue([
      {
        amount: 100,
        commissionAmount: 10,
        booking: { artisan: { id: "ap_1", user: { name: "Kofi", email: "k@test.com" } } },
      },
    ])
    prismaMock.artisanPayout.findMany.mockResolvedValue([{ artisanId: "ap_1", amount: 20 }])

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json[0].owed).toBe(70)
    expect(json[0].net).toBe(90)
  })

  it("POST records a payout", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.artisanProfile.findUnique.mockResolvedValue({ id: "ap_1" })
    prismaMock.artisanPayout.create.mockResolvedValue({ id: "po_1", amount: 50 })

    const res = await POST(
      new Request("http://localhost/api/admin/payouts", {
        method: "POST",
        body: JSON.stringify({ artisanId: "ap_1", amount: 50 }),
      })
    )
    expect(res.status).toBe(200)
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "PAYOUT_MARK_PAID" }),
      })
    )
  })

  it("POST rejects a non-positive amount", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    const res = await POST(
      new Request("http://localhost/api/admin/payouts", {
        method: "POST",
        body: JSON.stringify({ artisanId: "ap_1", amount: 0 }),
      })
    )
    expect(res.status).toBe(400)
  })
})
