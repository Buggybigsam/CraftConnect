import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { artisanUserId, serviceId, date, notes } = await request.json()

  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 })

    const booking = await prisma.booking.create({
      data: {
        customerId: userId,
        artisanId: service.artisanId,
        serviceId,
        date: new Date(date),
        notes,
        status: "PENDING",
      },
    })

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

export async function GET(request: Request) {
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

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId } })
  if (!artisan) return NextResponse.json({ error: "Not an artisan" }, { status: 403 })

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, artisanId: artisan.id },
  })
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  })

  return NextResponse.json(updated)
}
