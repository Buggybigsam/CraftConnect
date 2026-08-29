import { describe, it, expect, vi, beforeEach } from "vitest"

const prismaMock = vi.hoisted(() => ({
  artisanProfile: { findMany: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { GET } from "./route"

function searchRequest(query: string, ip = "203.0.113.1") {
  return new Request(`http://localhost/api/artisans${query}`, {
    headers: { "x-forwarded-for": ip },
  })
}

describe("GET /api/artisans", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.artisanProfile.findMany.mockResolvedValue([])
  })

  it("returns artisans for a plain request with no filters", async () => {
    const res = await GET(searchRequest(""))

    expect(res.status).toBe(200)
    expect(prismaMock.artisanProfile.findMany).toHaveBeenCalled()
  })

  it("rejects a non-numeric minRating with a 400 instead of 500ing", async () => {
    const res = await GET(searchRequest("?minRating=not-a-number"))

    expect(res.status).toBe(400)
    expect(prismaMock.artisanProfile.findMany).not.toHaveBeenCalled()
  })

  it("rejects a non-numeric minPrice with a 400", async () => {
    const res = await GET(searchRequest("?minPrice=abc"))

    expect(res.status).toBe(400)
    expect(prismaMock.artisanProfile.findMany).not.toHaveBeenCalled()
  })

  it("rejects a non-numeric maxPrice with a 400", async () => {
    const res = await GET(searchRequest("?maxPrice=xyz"))

    expect(res.status).toBe(400)
    expect(prismaMock.artisanProfile.findMany).not.toHaveBeenCalled()
  })

  it("accepts valid numeric filters", async () => {
    const res = await GET(searchRequest("?minRating=4&minPrice=10&maxPrice=200"))

    expect(res.status).toBe(200)
    expect(prismaMock.artisanProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          rating: { gte: 4 },
          pricePerHour: { gte: 10, lte: 200 },
        }),
      })
    )
  })

  it("returns 429 once the per-IP rate limit is exceeded", async () => {
    const ip = "198.51.100.42"
    for (let i = 0; i < 60; i++) {
      const res = await GET(searchRequest("", ip))
      expect(res.status).toBe(200)
    }

    const res = await GET(searchRequest("", ip))
    expect(res.status).toBe(429)
  })
})
