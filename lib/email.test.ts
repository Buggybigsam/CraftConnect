import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const setApiKeyMock = vi.hoisted(() => vi.fn())
const sendMock = vi.hoisted(() => vi.fn())

vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: setApiKeyMock,
    send: sendMock,
  },
}))

describe("lib/email", () => {
  const originalApiKey = process.env.SENDGRID_API_KEY
  const originalFromEmail = process.env.SENDGRID_FROM_EMAIL

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.SENDGRID_API_KEY = originalApiKey
    process.env.SENDGRID_FROM_EMAIL = originalFromEmail
  })

  it("configures the SendGrid client with SENDGRID_API_KEY from the environment", async () => {
    process.env.SENDGRID_API_KEY = "SG.test_key"
    const { email: emailClient } = await import("./email")

    await emailClient.send({ to: "a@example.com", from: "b@example.com", subject: "x", html: "x" })

    expect(setApiKeyMock).toHaveBeenCalledWith("SG.test_key")
  })

  it("falls back to a placeholder key when SENDGRID_API_KEY is unset", async () => {
    delete process.env.SENDGRID_API_KEY
    const { email: emailClient } = await import("./email")

    await emailClient.send({ to: "a@example.com", from: "b@example.com", subject: "x", html: "x" })

    expect(setApiKeyMock).toHaveBeenCalledWith("SG.placeholder")
  })

  it("only configures the API key once across multiple sends", async () => {
    process.env.SENDGRID_API_KEY = "SG.test_key"
    const { email: emailClient } = await import("./email")

    await emailClient.send({ to: "a@example.com", from: "b@example.com", subject: "x", html: "x" })
    await emailClient.send({ to: "c@example.com", from: "b@example.com", subject: "y", html: "y" })

    expect(setApiKeyMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledTimes(2)
  })

  it("delegates email.send to the underlying SendGrid client with the same arguments", async () => {
    process.env.SENDGRID_API_KEY = "SG.test_key"
    sendMock.mockResolvedValue([{ statusCode: 202 }, {}])
    const { email: emailClient } = await import("./email")

    const result = await emailClient.send({
      from: "noreply@CraftConnect.com",
      to: "customer@example.com",
      subject: "Booking confirmed",
      html: "<p>Your booking is confirmed.</p>",
    })

    expect(sendMock).toHaveBeenCalledWith({
      from: "noreply@CraftConnect.com",
      to: "customer@example.com",
      subject: "Booking confirmed",
      html: "<p>Your booking is confirmed.</p>",
    })
    expect(result).toEqual([{ statusCode: 202 }, {}])
  })

  it("propagates a send failure instead of swallowing it", async () => {
    process.env.SENDGRID_API_KEY = "SG.test_key"
    sendMock.mockRejectedValue(new Error("SendGrid API unreachable"))
    const { email: emailClient } = await import("./email")

    await expect(
      emailClient.send({ from: "noreply@CraftConnect.com", to: "customer@example.com", subject: "x", html: "x" })
    ).rejects.toThrow("SendGrid API unreachable")
  })

  it("defaults FROM_EMAIL when SENDGRID_FROM_EMAIL is unset", async () => {
    delete process.env.SENDGRID_FROM_EMAIL
    const { FROM_EMAIL } = await import("./email")

    expect(FROM_EMAIL).toBe("noreply@CraftConnect.com")
  })

  it("uses SENDGRID_FROM_EMAIL when it is set", async () => {
    process.env.SENDGRID_FROM_EMAIL = "hello@example.com"
    const { FROM_EMAIL } = await import("./email")

    expect(FROM_EMAIL).toBe("hello@example.com")
  })
})
