import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const location = searchParams.get("location") ?? ""
  const minRating = parseFloat(searchParams.get("minRating") ?? "0")
  const maxPrice = parseFloat(searchParams.get("maxPrice") ?? "99999")
  const minPrice = parseFloat(searchParams.get("minPrice") ?? "0")

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
