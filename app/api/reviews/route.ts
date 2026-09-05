import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

const REVIEWS_RATE_LIMIT = 20
const REVIEWS_RATE_WINDOW_MS = 60 * 1000

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimit = checkRateLimit(
    `reviews:${getClientIp(request)}`,
    REVIEWS_RATE_LIMIT,
    REVIEWS_RATE_WINDOW_MS
  )
  if (!rateLimit.ok) return rateLimitResponse(rateLimit)

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

  // Transaction avoids two concurrent reviews both reading a stale average.
  const review = await prisma.$transaction(async (tx) => {
    const createdReview = await tx.review.create({
      data: {
        customerId: userId,
        artisanId: artisan.id,
        bookingId,
        rating,
        comment,
        flagged: rating <= 2,
      },
    })

    const allReviews = await tx.review.findMany({
      where: { artisanId: artisan.id, removedAt: null },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await tx.artisanProfile.update({
      where: { id: artisan.id },
      data: { rating: avgRating, totalReviews: allReviews.length },
    })

    return createdReview
  })

  if (review.flagged) {
    const { createAdminAlert } = await import("@/lib/admin")
    await createAdminAlert({
      type: "FLAGGED_REVIEW",
      title: "New low-rated review",
      message: `A ${rating}-star review was automatically flagged.`,
      link: "/admin/reviews",
    })
  }

  return NextResponse.json(review)
}
