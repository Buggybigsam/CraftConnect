import { describe, it, expect, vi, beforeEach } from "vitest"

const authMock = vi.hoisted(() => vi.fn())
const currentUserMock = vi.hoisted(() => vi.fn())
const updateUserMetadataMock = vi.hoisted(() => vi.fn())

const prismaMock = vi.hoisted(() => ({
  user: { upsert: vi.fn(), findUnique: vi.fn() },
  artisanProfile: { upsert: vi.fn() },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
  currentUser: () => currentUserMock(),
  clerkClient: async () => ({ users: { updateUserMetadata: updateUserMetadataMock } }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { POST } from "./route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/users/onboard", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

const clerkUser = {
  firstName: "Ama",
  lastName: "Owusu",
  emailAddresses: [{ emailAddress: "ama@example.com" }],
  imageUrl: "https://img.example/ama.png",
}

describe("POST /api/users/onboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateUserMetadataMock.mockResolvedValue({})
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", role: "CUSTOMER" })
  })

  it("returns 401 when the caller is not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null })

    const res = await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(res.status).toBe(401)
    expect(prismaMock.user.upsert).not.toHaveBeenCalled()
  })

  it("returns 404 when Clerk has no user record for the session", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue(null)

    const res = await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(res.status).toBe(404)
  })

  it("onboards a customer by default when role is omitted", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockResolvedValue({})
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", role: "CUSTOMER" })

    const res = await POST(jsonRequest({}))

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_1" },
        create: expect.objectContaining({ role: "CUSTOMER", name: "Ama Owusu" }),
      })
    )
    expect(prismaMock.artisanProfile.upsert).not.toHaveBeenCalled()
    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_1", {
      publicMetadata: { role: "CUSTOMER" },
    })
    expect(res.status).toBe(200)
  })

  it("falls back to a default display name when Clerk has no first/last name", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue({ ...clerkUser, firstName: null, lastName: null })
    prismaMock.user.upsert.mockResolvedValue({})

    await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ name: "User" }),
      })
    )
  })

  it("falls back to an empty email when Clerk has no verified email address", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue({ ...clerkUser, emailAddresses: [] })
    prismaMock.user.upsert.mockResolvedValue({})

    await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ email: "" }),
      })
    )
  })

  it("onboards an artisan, creates a PENDING profile, and syncs Clerk metadata", async () => {
    authMock.mockResolvedValue({ userId: "user_2" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockResolvedValue({})
    prismaMock.artisanProfile.upsert.mockResolvedValue({})
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_2", role: "ARTISAN" })

    const res = await POST(
      jsonRequest({
        role: "ARTISAN",
        bio: "Master carpenter",
        category: "Carpentry",
        pricePerHour: 50,
        location: "Accra",
        phone: "0244000000",
        yearsExp: 5,
      })
    )

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ role: "ARTISAN" }),
        create: expect.objectContaining({ role: "ARTISAN" }),
      })
    )
    expect(prismaMock.artisanProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_2" },
        create: expect.objectContaining({ status: "PENDING", category: "Carpentry" }),
        update: expect.objectContaining({ status: "PENDING" }),
      })
    )
    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_2", {
      publicMetadata: { role: "ARTISAN" },
    })
    expect(res.status).toBe(200)
  })

  it("re-onboarding an existing artisan resets status back to PENDING (re-review on edit)", async () => {
    authMock.mockResolvedValue({ userId: "user_2" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockResolvedValue({})
    prismaMock.artisanProfile.upsert.mockResolvedValue({})

    await POST(jsonRequest({ role: "ARTISAN", category: "Plumbing" }))

    expect(prismaMock.artisanProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ status: "PENDING" }),
      })
    )
  })

  it("preserves an existing ADMIN role in Clerk when re-onboarding as customer", async () => {
    authMock.mockResolvedValue({ userId: "admin_1" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockResolvedValue({ id: "admin_1", role: "ADMIN" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin_1", role: "ADMIN" })

    const res = await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(updateUserMetadataMock).toHaveBeenCalledWith("admin_1", {
      publicMetadata: { role: "ADMIN" },
    })
    expect(res.status).toBe(200)
  })

  it("preserves an existing ARTISAN role in Clerk when re-onboarding as customer", async () => {
    authMock.mockResolvedValue({ userId: "artisan_1" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockResolvedValue({ id: "artisan_1", role: "ARTISAN" })
    prismaMock.user.findUnique.mockResolvedValue({ id: "artisan_1", role: "ARTISAN" })

    await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(updateUserMetadataMock).toHaveBeenCalledWith("artisan_1", {
      publicMetadata: { role: "ARTISAN" },
    })
  })

  it("returns 500 when the database write fails", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockRejectedValue(new Error("db down"))

    const res = await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(res.status).toBe(500)
  })

  it("returns 500 when Clerk metadata sync fails after the DB write succeeds", async () => {
    authMock.mockResolvedValue({ userId: "user_1" })
    currentUserMock.mockResolvedValue(clerkUser)
    prismaMock.user.upsert.mockResolvedValue({})
    updateUserMetadataMock.mockRejectedValue(new Error("clerk down"))

    const res = await POST(jsonRequest({ role: "CUSTOMER" }))

    expect(res.status).toBe(500)
  })
})
