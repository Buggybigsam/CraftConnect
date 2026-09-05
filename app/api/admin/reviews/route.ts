import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, writeAuditLog, createAdminAlert } from "@/lib/admin"

async function recalcArtisanRating(artisanId: string) {
  const reviews = await prisma.review.findMany({
    where: { artisanId, removedAt: null },
    select: { rating: true },
  })
  const avg = reviews.length === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  await prisma.artisanProfile.update({
    where: { id: artisanId },
    data: { rating: avg, totalReviews: reviews.length },
  })
}

export async function GET(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { searchParams } = new URL(request.url)
  const flagged = searchParams.get("flagged") === "true"

  const reviews = await prisma.review.findMany({
    where: {
      removedAt: null,
      ...(flagged ? { flagged: true } : {}),
    },
    include: {
      customer: { select: { name: true, email: true } },
      artisan: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reviews)
}

export async function PATCH(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { reviewId, action } = await request.json()
  if (!reviewId || !["flag", "unflag", "remove"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review || review.removedAt) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  if (action === "remove") {
    await prisma.review.update({
      where: { id: reviewId },
      data: { removedAt: new Date(), flagged: false },
    })
    await recalcArtisanRating(review.artisanId)
    await writeAuditLog(authz.admin.id, "REVIEW_REMOVE", "Review", reviewId)
    return NextResponse.json({ success: true })
  }

  const flagged = action === "flag"
  await prisma.review.update({
    where: { id: reviewId },
    data: { flagged },
  })

  if (flagged) {
    await createAdminAlert({
      type: "FLAGGED_REVIEW",
      title: "Review flagged",
      message: `A ${review.rating}-star review was flagged for moderation.`,
      link: "/admin/reviews",
    })
  }

  await writeAuditLog(authz.admin.id, flagged ? "REVIEW_FLAG" : "REVIEW_UNFLAG", "Review", reviewId)
  return NextResponse.json({ success: true })
}
