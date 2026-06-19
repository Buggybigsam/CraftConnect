import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId, artisanUserId, rating, comment } = await request.json()

  if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 })

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: userId, status: "COMPLETED" },
  })
  if (!booking) return NextResponse.json({ error: "Booking not found or not completed" }, { status: 404 })

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: artisanUserId } })
  if (!artisan) return NextResponse.json({ error: "Artisan not found" }, { status: 404 })

  const review = await prisma.review.create({
    data: {
      customerId: userId,
      artisanId: artisan.id,
      bookingId,
      rating,
      comment,
    },
  })

  // Recalculate artisan rating
  const allReviews = await prisma.review.findMany({
    where: { artisanId: artisan.id },
    select: { rating: true },
  })
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

  await prisma.artisanProfile.update({
    where: { id: artisan.id },
    data: { rating: avgRating, totalReviews: allReviews.length },
  })

  return NextResponse.json(review)
}
