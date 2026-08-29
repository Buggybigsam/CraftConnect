import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

const BOOKINGS_RATE_LIMIT = 10
const BOOKINGS_RATE_WINDOW_MS = 60 * 1000

// Prisma's generated error class carries a `code` field (e.g. "P2002" for a
// unique-constraint violation). We check duck-typed shape rather than importing
// the class so this stays decoupled from the generated client's exact path.
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  )
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimit = checkRateLimit(`bookings:${getClientIp(request)}`, BOOKINGS_RATE_LIMIT, BOOKINGS_RATE_WINDOW_MS)
  if (!rateLimit.ok) return rateLimitResponse(rateLimit)

  const { serviceId, date, notes } = await request.json()

  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 })

    // Zero out seconds/ms so the unique(artisanId, date) constraint actually
    // catches two bookings for the same displayed slot instead of letting
    // millisecond-apart timestamps both through.
    const slotDate = new Date(date)
    if (Number.isNaN(slotDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }
    slotDate.setSeconds(0, 0)

    let booking
    try {
      booking = await prisma.booking.create({
        data: {
          customerId: userId,
          artisanId: service.artisanId,
          serviceId,
          date: slotDate,
          notes,
          status: "PENDING",
        },
      })
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        return NextResponse.json({ error: "This slot is already booked" }, { status: 409 })
      }
      throw err
    }

    // Initialize Paystack payment
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: service.price * 100, // Paystack uses pesewas/kobo
        currency: "GHS",
        email: (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email,
        reference: `booking_${booking.id}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/payment/verify?bookingId=${booking.id}`,
        metadata: { bookingId: booking.id },
      }),
    })

    const paystackData = await paystackRes.json()

    if (!paystackData.status) {
      await prisma.booking.delete({ where: { id: booking.id } })
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 })
    }

    // Store pending payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: service.price,
        currency: "GHS",
        reference: paystackData.data.reference,
        status: "PENDING",
      },
    })

    return NextResponse.json({ paymentUrl: paystackData.data.authorization_url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (user.role === "ARTISAN") {
    const artisan = await prisma.artisanProfile.findUnique({ where: { userId } })
    if (!artisan) return NextResponse.json([])

    const bookings = await prisma.booking.findMany({
      where: { artisanId: artisan.id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        service: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(bookings)
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      artisan: { include: { user: { select: { name: true, imageUrl: true } } } },
      service: true,
      payment: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(bookings)
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId, status } = await request.json()

  const allowedStatuses = ["CONFIRMED", "CANCELLED"]
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId } })
  if (!artisan) return NextResponse.json({ error: "Not an artisan" }, { status: 403 })

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, artisanId: artisan.id },
  })
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  // Guard the PENDING -> {CONFIRMED,CANCELLED} transition atomically. Checking
  // booking.status above and then updating separately left a window where two
  // concurrent requests could both pass the check and both apply their update.
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, artisanId: artisan.id, status: "PENDING" },
    data: { status },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Booking already actioned" }, { status: 409 })
  }

  const updated = await prisma.booking.findUnique({ where: { id: bookingId } })
  return NextResponse.json(updated)
}
