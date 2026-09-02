"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function cancelBookingAction(bookingId: string) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking || booking.customerId !== userId) {
    return { success: false, error: "Booking not found" }
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return { success: false, error: `Cannot cancel a ${booking.status.toLowerCase()} booking` }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })

  revalidatePath("/customer/dashboard")
  revalidatePath("/artisan/dashboard")
  return { success: true }
}

export async function rescheduleBookingAction(bookingId: string, newDateIso: string) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking || booking.customerId !== userId) {
    return { success: false, error: "Booking not found" }
  }

  if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
    return { success: false, error: "Only active bookings can be rescheduled" }
  }

  const slotDate = new Date(newDateIso)
  if (Number.isNaN(slotDate.getTime())) {
    return { success: false, error: "Invalid date selected" }
  }
  slotDate.setSeconds(0, 0)

  // Check if slot already taken
  const existingSlot = await prisma.booking.findFirst({
    where: {
      artisanId: booking.artisanId,
      date: slotDate,
      id: { not: bookingId },
      status: { not: "CANCELLED" },
    },
  })

  if (existingSlot) {
    return { success: false, error: "This artisan is already booked for that time slot" }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { date: slotDate },
  })

  revalidatePath("/customer/dashboard")
  revalidatePath("/artisan/dashboard")
  return { success: true }
}

export async function toggleSavedArtisanAction(artisanId: string) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const existing = await prisma.savedArtisan.findUnique({
    where: {
      customerId_artisanId: {
        customerId: userId,
        artisanId,
      },
    },
  })

  if (existing) {
    await prisma.savedArtisan.delete({
      where: { id: existing.id },
    })
    revalidatePath("/customer/dashboard")
    return { success: true, saved: false }
  }

  await prisma.savedArtisan.create({
    data: {
      customerId: userId,
      artisanId,
    },
  })

  revalidatePath("/customer/dashboard")
  return { success: true, saved: true }
}
