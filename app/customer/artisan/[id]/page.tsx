import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, User, ArrowLeft, Clock, Briefcase } from "lucide-react"

const CATEGORY_PHOTOS: Record<string, string> = {
  Electrician: "/images/artisans/electrician-outdoor-wall.jpg",
  Plumber:     "/images/artisans/plumber-sink.jpg",
  Carpenter:   "/images/artisans/carpenter-workshop.jpg",
  Painter:     "/images/artisans/painter-roller.jpg",
  Mechanic:    "/images/artisans/mechanic-engine.jpg",
  Mason:       "/images/artisans/mason-bricklaying.jpg",
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </div>
  )
}

export default async function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const artisan = await prisma.artisanProfile.findFirst({
    where: { userId: id, status: "APPROVED" },
    include: {
      user: true,
      services: true,
      reviews: {
        include: { customer: { select: { name: true, imageUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!artisan) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        <Link href="/customer/browse" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm transition">
          <ArrowLeft size={14} /> Back to Browse
        </Link>

        {/* Category banner */}
        {CATEGORY_PHOTOS[artisan.category] && (
          <div className="relative h-40 sm:h-52 w-full rounded-2xl overflow-hidden">
            <Image
              src={CATEGORY_PHOTOS[artisan.category]}
              alt={`${artisan.category} at work`}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row gap-5">
          {artisan.user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artisan.user.imageUrl} className="w-20 h-20 rounded-full object-cover shrink-0" alt={artisan.user.name} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <User size={36} className="text-emerald-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{artisan.user.name}</h1>
            <p className="text-emerald-600 font-medium text-sm">{artisan.category}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin size={12} />{artisan.location}</span>
              <span className="flex items-center gap-1"><Briefcase size={12} />{artisan.yearsExp} yrs experience</span>
              <span className="flex items-center gap-1"><Clock size={12} />Usually replies quickly</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-900">{artisan.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-xs">({artisan.totalReviews} reviews)</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-slate-900">GHS {artisan.pricePerHour}</div>
            <div className="text-slate-400 text-xs">per hour</div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide text-slate-400">About</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{artisan.bio}</p>
        </div>

        {/* Services */}
        {artisan.services.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide text-slate-400">Services Offered</h2>
            <div className="space-y-3">
              {artisan.services.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{s.title}</div>
                    <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.description}</div>
                  </div>
                  <div className="text-emerald-700 font-bold text-sm shrink-0">GHS {s.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book CTA */}
        <div className="bg-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg">Ready to book {artisan.user.name}?</h2>
              <p className="text-emerald-200 text-sm mt-0.5">Pick a date and time that works for you.</p>
            </div>
            <Link
              href={`/customer/booking/${artisan.userId}`}
              className="shrink-0 bg-white text-emerald-700 font-semibold px-7 py-3 rounded-xl hover:bg-emerald-50 transition text-sm"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* Reviews */}
        {artisan.reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide text-slate-400">
              Customer Reviews ({artisan.reviews.length})
            </h2>
            <div className="space-y-4">
              {artisan.reviews.map((r) => (
                <div key={r.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                      <User size={14} className="text-emerald-300" />
                    </div>
                    <span className="font-medium text-sm text-slate-900">{r.customer.name}</span>
                    <StarDisplay rating={r.rating} />
                  </div>
                  <p className="text-slate-600 text-sm pl-9">{r.comment}</p>
                  <p className="text-slate-400 text-xs mt-1 pl-9">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
