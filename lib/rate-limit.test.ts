import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { checkRateLimit, getClientIp, rateLimitResponse } from "./rate-limit"

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows requests under the limit", () => {
    const result = checkRateLimit("key1", 3, 1000)
    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it("blocks once the limit is reached within the window", () => {
    checkRateLimit("key2", 2, 1000)
    checkRateLimit("key2", 2, 1000)
    const result = checkRateLimit("key2", 2, 1000)

    expect(result.ok).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it("allows requests again once the window has fully elapsed", () => {
    checkRateLimit("key3", 1, 1000)
    expect(checkRateLimit("key3", 1, 1000).ok).toBe(false)

    vi.setSystemTime(1001)

    expect(checkRateLimit("key3", 1, 1000).ok).toBe(true)
  })

  it("tracks separate keys independently", () => {
    checkRateLimit("key4a", 1, 1000)
    const other = checkRateLimit("key4b", 1, 1000)

    expect(other.ok).toBe(true)
  })

  it("treats a limit of 0 as always blocked", () => {
    const result = checkRateLimit("key5", 0, 1000)
    expect(result.ok).toBe(false)
  })
})

describe("getClientIp", () => {
  it("reads the first address from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    })
    expect(getClientIp(req)).toBe("1.2.3.4")
  })

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "9.9.9.9" },
    })
    expect(getClientIp(req)).toBe("9.9.9.9")
  })

  it("falls back to 'unknown' when neither header is present", () => {
    const req = new Request("http://localhost")
    expect(getClientIp(req)).toBe("unknown")
  })
})

describe("rateLimitResponse", () => {
  it("returns 429 with a Retry-After header derived from retryAfterMs", async () => {
    const res = rateLimitResponse({ ok: false, remaining: 0, retryAfterMs: 2500 })

    expect(res.status).toBe(429)
    expect(res.headers.get("Retry-After")).toBe("3")
    const body = await res.json()
    expect(body.error).toMatch(/too many requests/i)
  })
})
