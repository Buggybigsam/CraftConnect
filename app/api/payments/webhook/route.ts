import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("x-paystack-signature") ?? ""
  const secret = process.env.PAYSTACK_SECRET_KEY ?? ""

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === "charge.success") {
    const reference = event.data.reference as string
    await prisma.payment.update({
      where: { reference },
      data: { status: "SUCCESS", paidAt: new Date() },
    })

    const payment = await prisma.payment.findUnique({
      where: { reference },
      select: { bookingId: true },
    })

    if (payment) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      })
    }
  }

  return NextResponse.json({ received: true })
}
