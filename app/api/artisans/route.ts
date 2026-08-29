import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

const ARTISANS_RATE_LIMIT = 60
const ARTISANS_RATE_WINDOW_MS = 60 * 1000

function parseNumericParam(raw: string | null, fallback: number): number | null {
  if (raw === null) return fallback
  const value = parseFloat(raw)
  return Number.isFinite(value) ? value : null
}

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(`artisans:${getClientIp(request)}`, ARTISANS_RATE_LIMIT, ARTISANS_RATE_WINDOW_MS)
  if (!rateLimit.ok) return rateLimitResponse(rateLimit)

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const location = searchParams.get("location") ?? ""

  const minRating = parseNumericParam(searchParams.get("minRating"), 0)
  const maxPrice = parseNumericParam(searchParams.get("maxPrice"), 99999)
  const minPrice = parseNumericParam(searchParams.get("minPrice"), 0)

  if (minRating === null || maxPrice === null || minPrice === null) {
    return NextResponse.json({ error: "minRating, minPrice, and maxPrice must be numeric" }, { status: 400 })
  }

  const artisans = await prisma.artisanProfile.findMany({
    where: {
      status: "APPROVED",
      ...(category && { category }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
      rating: { gte: minRating },
      pricePerHour: { gte: minPrice, lte: maxPrice },
      ...(q && {
        OR: [
          { user: { name: { contains: q, mode: "insensitive" } } },
          { category: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { user: { select: { id: true, name: true, imageUrl: true } } },
    orderBy: { rating: "desc" },
  })

  return NextResponse.json(artisans)
}
