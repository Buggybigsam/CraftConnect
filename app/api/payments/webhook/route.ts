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
    // Fail closed instead of hashing against an empty, forgeable key.
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
        select: { bookingId: true, status: true, amount: true },
      })

      // Unknown or already-processed reference: acknowledge without reprocessing.
      if (!payment || payment.status === "SUCCESS") {
        return NextResponse.json({ received: true })
      }

      const config = await prisma.platformConfig.findUnique({ where: { id: "default" } })
      const percent = config?.platformFeePercent ?? 10
      const commissionAmount = Math.round(payment.amount * percent) / 100

      await prisma.payment.update({
        where: { reference },
        data: { status: "SUCCESS", paidAt: new Date(), commissionAmount },
      })

      try {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        })
      } catch (err) {
        // Booking is gone: acknowledge so Paystack stops retrying a dead delivery.
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

  if (event.event === "charge.failed") {
    const reference = event.data?.reference
    if (reference) {
      const payment = await prisma.payment.findUnique({
        where: { reference },
        select: { id: true, status: true, amount: true },
      })
      if (payment && payment.status !== "SUCCESS" && payment.status !== "REFUNDED") {
        await prisma.payment.update({
          where: { reference },
          data: { status: "FAILED" },
        })
        await prisma.adminAlert.create({
          data: {
            type: "FAILED_PAYMENT",
            title: "Payment failed",
            message: `Payment ${reference} (GHS ${payment.amount}) failed.`,
            link: "/admin/bookings",
          },
        }).catch(console.error)
      }
    }
  }

  return NextResponse.json({ received: true })
}
