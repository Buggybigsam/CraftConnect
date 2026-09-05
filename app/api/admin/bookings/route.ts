import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, writeAuditLog } from "@/lib/admin"

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  )
}

async function refundPaystack(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return { ok: false as const, error: "Paystack is not configured" }
  }

  const res = await fetch("https://api.paystack.co/refund", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transaction: reference }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.status) {
    return { ok: false as const, error: data?.message ?? "Paystack refund failed" }
  }
  return { ok: true as const }
}

export async function PATCH(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { bookingId, action, artisanId } = await request.json()
  if (!bookingId || !["cancel", "refund", "reassign"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, artisan: { select: { id: true } } },
  })
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  if (action === "cancel") {
    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 409 })
    }
    if (booking.status === "COMPLETED") {
      return NextResponse.json({ error: "Completed bookings cannot be cancelled" }, { status: 409 })
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })

    await writeAuditLog(authz.admin.id, "BOOKING_CANCEL", "Booking", bookingId)
    return NextResponse.json({ success: true })
  }

  if (action === "refund") {
    if (!booking.payment || booking.payment.status !== "SUCCESS") {
      return NextResponse.json({ error: "No successful payment to refund" }, { status: 409 })
    }

    const refund = await refundPaystack(booking.payment.reference)
    if (!refund.ok) {
      return NextResponse.json({ error: refund.error }, { status: 502 })
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: "REFUNDED" },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      }),
    ])

    await writeAuditLog(authz.admin.id, "BOOKING_REFUND", "Booking", bookingId, {
      reference: booking.payment.reference,
      amount: booking.payment.amount,
    })
    return NextResponse.json({ success: true })
  }

  if (!artisanId) {
    return NextResponse.json({ error: "artisanId is required" }, { status: 400 })
  }
  if (artisanId === booking.artisanId) {
    return NextResponse.json({ error: "Booking is already assigned to this artisan" }, { status: 409 })
  }

  const target = await prisma.artisanProfile.findUnique({ where: { id: artisanId } })
  if (!target || target.status !== "APPROVED") {
    return NextResponse.json({ error: "Target artisan not found or not approved" }, { status: 404 })
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { artisanId },
    })
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return NextResponse.json({ error: "Target artisan already has a booking at this time" }, { status: 409 })
    }
    throw err
  }

  await writeAuditLog(authz.admin.id, "BOOKING_REASSIGN", "Booking", bookingId, {
    fromArtisanId: booking.artisanId,
    toArtisanId: artisanId,
  })
  return NextResponse.json({ success: true })
}
