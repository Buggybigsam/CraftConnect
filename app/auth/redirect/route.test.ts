import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const currentUserMock = vi.hoisted(() => vi.fn())
const updateUserMetadataMock = vi.hoisted(() => vi.fn())

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  artisanProfile: { findUnique: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
  currentUser: () => currentUserMock(),
  clerkClient: async () => ({ users: { updateUserMetadata: updateUserMetadataMock } }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET } from "./route"

function redirectRequest(path = "http://localhost/auth/redirect") {
  return new Request(path)
}

describe("GET /auth/redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.artisanProfile.findUnique.mockResolvedValue(null)
    updateUserMetadataMock.mockResolvedValue({})
  })

  it("sends unauthenticated callers to sign-in", async () => {
    authMock.mockResolvedValue({ userId: null })
    const res = await GET(redirectRequest())
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/sign-in")
  })

  it("does not call Clerk when publicMetadata already matches the DB role", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue({
      id: "user_1",
      firstName: "Ama",
      lastName: "Owusu",
      emailAddresses: [{ emailAddress: "ama@test.com" }],
      imageUrl: "",
      publicMetadata: { role: "CUSTOMER" },
    })
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", role: "CUSTOMER" })

    const res = await GET(redirectRequest())

    expect(updateUserMetadataMock).not.toHaveBeenCalled()
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/customer/dashboard")
    expect(res.headers.get("set-cookie")).toMatch(/sb_role=CUSTOMER/)
  })

  it("still redirects when Clerk metadata sync is rate-limited", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue({
      id: "user_1",
      firstName: "Ama",
      lastName: "Owusu",
      emailAddresses: [{ emailAddress: "ama@test.com" }],
      imageUrl: "",
      publicMetadata: {},
    })
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", role: "CUSTOMER" })
    updateUserMetadataMock.mockRejectedValue(new Error("too_many_requests"))

    const res = await GET(redirectRequest())

    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/customer/dashboard")
    expect(res.headers.get("set-cookie")).toMatch(/sb_role=CUSTOMER/)
  })
})
