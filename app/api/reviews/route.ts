import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId, artisanUserId, rating, comment } = await request.json()

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 })
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: userId, status: "COMPLETED" },
  })
  if (!booking) return NextResponse.json({ error: "Booking not found or not completed" }, { status: 404 })

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: artisanUserId } })
  if (!artisan) return NextResponse.json({ error: "Artisan not found" }, { status: 404 })

  const existingReview = await prisma.review.findUnique({ where: { bookingId } })
  if (existingReview) return NextResponse.json({ error: "Booking already reviewed" }, { status: 409 })

  // Create the review and recompute the artisan's average rating inside a single
  // transaction so two concurrent submissions for the same artisan can't both read
  // a stale review list and write a stale average.
  const review = await prisma.$transaction(async (tx) => {
    const createdReview = await tx.review.create({
      data: {
        customerId: userId,
        artisanId: artisan.id,
        bookingId,
        rating,
        comment,
      },
    })

    const allReviews = await tx.review.findMany({
      where: { artisanId: artisan.id },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await tx.artisanProfile.update({
      where: { id: artisan.id },
      data: { rating: avgRating, totalReviews: allReviews.length },
    })

    return createdReview
  })

  return NextResponse.json(review)
}
