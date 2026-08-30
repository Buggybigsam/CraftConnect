import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const sendMock = vi.hoisted(() => vi.fn())

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { apiKey: string; emails: unknown }, apiKey: string) {
    this.apiKey = apiKey
    this.emails = { send: sendMock }
  }),
}))

describe("lib/resend", () => {
  const originalApiKey = process.env.RESEND_API_KEY
  const originalFromEmail = process.env.RESEND_FROM_EMAIL

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    process.env.RESEND_API_KEY = originalApiKey
    process.env.RESEND_FROM_EMAIL = originalFromEmail
  })

  it("constructs the Resend client with RESEND_API_KEY from the environment", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    const { getResend } = await import("./resend")
    const { Resend } = await import("resend")

    getResend()

    expect(Resend).toHaveBeenCalledWith("re_test_key")
  })

  it("falls back to a placeholder key when RESEND_API_KEY is unset", async () => {
    delete process.env.RESEND_API_KEY
    const { getResend } = await import("./resend")
    const { Resend } = await import("resend")

    getResend()

    expect(Resend).toHaveBeenCalledWith("re_placeholder")
  })

  it("memoizes the client instead of constructing a new one per call", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    const { getResend } = await import("./resend")
    const { Resend } = await import("resend")

    const first = getResend()
    const second = getResend()

    expect(first).toBe(second)
    expect(Resend).toHaveBeenCalledTimes(1)
  })

  it("delegates resend.emails.send to the underlying client with the same arguments", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null })
    const { resend } = await import("./resend")

    const result = await resend.emails.send({
      from: "noreply@smartbooking.com",
      to: "customer@example.com",
      subject: "Booking confirmed",
      html: "<p>Your booking is confirmed.</p>",
    } as never)

    expect(sendMock).toHaveBeenCalledWith({
      from: "noreply@smartbooking.com",
      to: "customer@example.com",
      subject: "Booking confirmed",
      html: "<p>Your booking is confirmed.</p>",
    })
    expect(result).toEqual({ data: { id: "email_1" }, error: null })
  })

  it("propagates a send failure instead of swallowing it", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    sendMock.mockRejectedValue(new Error("Resend API unreachable"))
    const { resend } = await import("./resend")

    await expect(
      resend.emails.send({
        from: "noreply@smartbooking.com",
        to: "customer@example.com",
        subject: "x",
        html: "x",
      } as never)
    ).rejects.toThrow("Resend API unreachable")
  })

  it("defaults FROM_EMAIL when RESEND_FROM_EMAIL is unset", async () => {
    delete process.env.RESEND_FROM_EMAIL
    const { FROM_EMAIL } = await import("./resend")

    expect(FROM_EMAIL).toBe("noreply@smartbooking.com")
  })

  it("uses RESEND_FROM_EMAIL when it is set", async () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "hello@example.com")
    const { FROM_EMAIL } = await import("./resend")

    expect(FROM_EMAIL).toBe("hello@example.com")
  })
})
