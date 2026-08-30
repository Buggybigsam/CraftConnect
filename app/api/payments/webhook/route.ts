import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import crypto from "crypto"

const WEBHOOK_RATE_LIMIT = 30
const WEBHOOK_RATE_WINDOW_MS = 60 * 1000

function isRecordNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2025"
  )
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`webhook:${getClientIp(request)}`, WEBHOOK_RATE_LIMIT, WEBHOOK_RATE_WINDOW_MS)
  if (!rateLimit.ok) return rateLimitResponse(rateLimit)

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    // Fail closed: an empty/missing secret must never be usable as an HMAC
    // key, or anyone could forge a valid signature for a misconfigured
    // deployment. Refuse the request instead of silently comparing against
    // a hash computed with "".
    console.error("PAYSTACK_SECRET_KEY is not set; rejecting webhook")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get("x-paystack-signature") ?? ""

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")
  const hashBuf = Buffer.from(hash, "hex")
  const signatureBuf = Buffer.from(signature, "hex")
  const validSignature =
    hashBuf.length === signatureBuf.length && crypto.timingSafeEqual(hashBuf, signatureBuf)

  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (event.event === "charge.success") {
    const reference = event.data?.reference
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 })
    }

    try {
      const payment = await prisma.payment.findUnique({
        where: { reference },
        select: { bookingId: true, status: true },
      })

      // Reference not found (e.g. webhook arrived before our own booking-creation
      // write committed) or already processed: acknowledge without erroring so
      // Paystack doesn't retry forever, but don't reprocess a completed payment.
      if (!payment || payment.status === "SUCCESS") {
        return NextResponse.json({ received: true })
      }

      await prisma.payment.update({
        where: { reference },
        data: { status: "SUCCESS", paidAt: new Date() },
      })

      try {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        })
      } catch (err) {
        // The booking backing this payment is gone (e.g. it was rolled back
        // when Paystack initialization failed elsewhere). Acknowledge the
        // webhook so Paystack stops retrying a delivery that can never
        // succeed, instead of 500ing forever.
        if (isRecordNotFoundError(err)) {
          console.error("Booking no longer exists for confirmed payment", payment.bookingId, err)
          return NextResponse.json({ received: true })
        }
        throw err
      }
    } catch (err) {
      console.error("Failed to process Paystack webhook", err)
      return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
