import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, User } from "lucide-react"
import BrowseFilters from "./_filters"

const CATEGORIES = [
  "All", "Electrician", "Plumber", "Cleaner", "Carpenter",
  "Painter", "Mechanic", "Tutor", "Mason", "Other",
]

const CATEGORY_PHOTOS: Record<string, string> = {
  Electrician: "/images/artisans/electrician-wiring.jpg",
  Plumber:     "/images/artisans/plumber-sink.jpg",
  Carpenter:   "/images/artisans/carpenter-workshop.jpg",
  Painter:     "/images/artisans/painter-roller.jpg",
  Mechanic:    "/images/artisans/mechanic-engine.jpg",
  Mason:       "/images/artisans/mason-plastering.jpg",
}

interface SearchParams {
  q?: string
  category?: string
  location?: string
  minRating?: string
  maxPrice?: string
}

async function getArtisans(params: SearchParams) {
  const { q = "", category = "", location = "", minRating = "0", maxPrice = "99999" } = params

  return prisma.artisanProfile.findMany({
    where: {
      status: "APPROVED",
      ...(category && category !== "All" && { category }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
      rating:       { gte: parseFloat(minRating) },
      pricePerHour: { lte: parseFloat(maxPrice)  },
      ...(q && {
        OR: [
          { user:     { name:     { contains: q, mode: "insensitive" } } },
          { category:             { contains: q, mode: "insensitive" }   },
          { bio:                  { contains: q, mode: "insensitive" }   },
        ],
      }),
    },
    include: { user: { select: { id: true, name: true, imageUrl: true } } },
    orderBy: { rating: "desc" },
  })
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params  = await searchParams
  const artisans = await getArtisans(params).catch(() => [])

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Find an Artisan</h1>
        <p className="text-slate-500 text-sm mb-6">Browse {artisans.length} verified professionals near you.</p>

        <BrowseFilters categories={CATEGORIES} params={params} />

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 mt-4 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const active = (params.category ?? "") === (cat === "All" ? "" : cat)
            return (
              <Link
                key={cat}
                href={`/customer/browse?${new URLSearchParams({ ...params, category: cat === "All" ? "" : cat })}`}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {artisans.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <User size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-medium mb-1">No artisans found</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {artisans.map((a) => (
              <Link
                key={a.id}
                href={`/customer/artisan/${a.userId}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {CATEGORY_PHOTOS[a.category] && (
                  <div className="relative h-32 w-full">
                    <Image
                      src={CATEGORY_PHOTOS[a.category]}
                      alt={`${a.category} at work`}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {a.user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.user.imageUrl} className="w-11 h-11 rounded-full object-cover" alt={a.user.name} />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
                      <User size={20} className="text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{a.user.name}</div>
                    <div className="text-xs text-emerald-600 font-medium">{a.category}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{a.bio}</p>

                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">{a.rating.toFixed(1)}</span>
                    <span className="text-slate-400 text-xs">({a.totalReviews})</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    GHS {a.pricePerHour}<span className="font-normal text-slate-400 text-xs">/hr</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} />
                  {a.location}
                </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
