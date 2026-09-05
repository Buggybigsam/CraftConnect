import { describe, it, expect, vi } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}))

import { computeCommission } from "./admin"

describe("computeCommission", () => {
  it("takes a percentage of the payment amount", () => {
    expect(computeCommission(100, 10)).toBe(10)
    expect(computeCommission(99.5, 10)).toBe(9.95)
  })
})
