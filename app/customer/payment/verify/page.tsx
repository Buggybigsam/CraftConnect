import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { resend, FROM_EMAIL } from "@/lib/resend"

interface SearchParams {
  bookingId?: string
  reference?: string
  trxref?: string
}

async function verifyPaystackPayment(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    cache: "no-store",
  })
  return res.json()
}

export default async function PaymentVerifyPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { bookingId, reference, trxref } = await searchParams
  const ref = reference ?? trxref

  if (!bookingId || !ref) redirect("/customer/dashboard")

  // Both bookingId and reference come from the redirect query string, which is
  // attacker-controllable. Without this check, a signed-in user could confirm an
  // arbitrary booking (their own or someone else's) as paid by pairing any of
  // their own genuinely-successful references with a different bookingId.
  const payment = await prisma.payment.findUnique({ where: { reference: ref } })
  if (!payment || payment.bookingId !== bookingId) {
    redirect("/customer/dashboard?failed=1")
  }

  const bookingOwner = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { customerId: true },
  })
  if (!bookingOwner || bookingOwner.customerId !== userId) {
    redirect("/customer/dashboard?failed=1")
  }

  const paystack = await verifyPaystackPayment(ref)

  if (paystack.data?.status === "success") {
    await prisma.payment.update({
      where: { reference: ref },
      data: { status: "SUCCESS", paidAt: new Date() },
    })
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    })

    // Send confirmation emails
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        artisan: { include: { user: true } },
        service: true,
      },
    })

    if (booking) {
      await Promise.allSettled([
        resend.emails.send({
          from: FROM_EMAIL,
          to: booking.customer.email,
          subject: "Booking Confirmed - SmartBooking",
          html: `<p>Hi ${booking.customer.name}, your booking for <strong>${booking.service.title}</strong> with ${booking.artisan.user.name} on ${new Date(booking.date).toLocaleDateString()} has been confirmed. Payment of GHS ${booking.service.price} received.</p>`,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: booking.artisan.user.email,
          subject: "New Booking - SmartBooking",
          html: `<p>Hi ${booking.artisan.user.name}, you have a new confirmed booking for <strong>${booking.service.title}</strong> on ${new Date(booking.date).toLocaleDateString()} from ${booking.customer.name}. Log in to view details.</p>`,
        }),
      ])
    }

    redirect(`/customer/dashboard?success=1`)
  } else {
    await prisma.payment.update({
      where: { reference: ref },
      data: { status: "FAILED" },
    })
    redirect(`/customer/dashboard?failed=1`)
  }
}
