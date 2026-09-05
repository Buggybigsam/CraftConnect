import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Star,
  User,
  ShieldCheck,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Settings,
  CheckCircle2,
  LayoutGrid,
  LucideIcon,
  ArrowRight,
} from "lucide-react"
import { ARTISAN_CATEGORIES, getArtisanPhoto } from "@/lib/artisan-categories"
import BrowseFilters from "./_filters"

const CAT_ICONS: Record<string, LucideIcon> = {
  "All Categories": LayoutGrid,
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Paintbrush,
  "AC Repair": Settings,
  Cleaning: Settings,
  "Appliance Repair": Settings,
  "Pest Control": Settings,
  Tiling: Settings,
  Welding: Settings,
  Masonry: Settings,
}

const CATEGORIES = ["All Categories", ...ARTISAN_CATEGORIES]

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
      ...(category && category !== "All Categories" && { category }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
      rating:       { gte: parseFloat(minRating) },
      pricePerHour: { lte: parseFloat(maxPrice)  },
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
}

function categoryHref(params: SearchParams, category: string) {
  const sp = new URLSearchParams()
  if (params.q) sp.set("q", params.q)
  if (params.location) sp.set("location", params.location)
  if (params.minRating) sp.set("minRating", params.minRating)
  if (params.maxPrice) sp.set("maxPrice", params.maxPrice)
  if (category !== "All Categories") sp.set("category", category)
  return `/customer/browse?${sp.toString()}`
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/auth/redirect")
  if (user.role === "ARTISAN") redirect("/artisan/dashboard")
  if (user.role === "ADMIN") redirect("/admin/dashboard")

  const params = await searchParams
  const artisans = await getArtisans(params).catch(() => [])
  const currentCategory = params.category || "All Categories"

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">CraftConnect marketplace</p>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Find Artisans</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Compare verified professionals by skill, location, rating, and price before you book.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-bold text-slate-950">{artisans.length}</span>
            <span className="ml-1 text-slate-500">available artisans</span>
          </div>
        </div>

        <BrowseFilters params={params} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Categories</h2>
                <p className="mt-1 text-xs text-slate-500">Filter by service type</p>
              </div>
              <div className="p-2">
                {CATEGORIES.map((cat) => {
                  const Icon = CAT_ICONS[cat] || LayoutGrid
                  const isActive = currentCategory === cat

                  return (
                    <Link
                      key={cat}
                      href={categoryHref(params, cat)}
                      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      <Icon size={17} className={isActive ? "text-white" : "text-slate-400"} />
                      {cat}
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>

          <div>
            {artisans.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <User size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="mb-1 text-base font-semibold text-slate-800">No artisans found</p>
                <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {artisans.map((a) => {
                  const artisanPhoto = getArtisanPhoto(a.user.name, a.category)

                  return (
                    <div
                      key={a.id}
                      className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md md:grid-cols-[auto_1fr_auto]"
                    >
                      <div className="flex items-start gap-4 md:block">
                        <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                          {artisanPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={artisanPhoto} className="h-full w-full object-cover" alt={`${a.category} artisan ${a.user.name}`} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                              <User size={30} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 md:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">{a.user.name}</h3>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {a.category}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <Star size={16} className="fill-amber-400 text-amber-400" />
                          {a.rating.toFixed(1)}
                          <span className="font-normal text-slate-400">({a.totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          <ShieldCheck size={14} /> Verified
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          {a.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-slate-400" />
                          {a.yearsExp}+ yrs experience
                        </div>
                      </div>

                      {a.bio && (
                        <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {a.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 md:min-w-40 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <div className="text-left md:text-right">
                        <div className="text-lg font-bold text-slate-950">GHS {a.pricePerHour}</div>
                        <div className="text-xs text-slate-500">per hour</div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/customer/artisan/${a.userId}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/customer/artisan/${a.userId}`}
                          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          Book <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
