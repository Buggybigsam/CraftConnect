import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Star } from "lucide-react"

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </span>
  )
}

export default async function ArtisanReviewsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { role: true } },
      reviews: {
        include: { customer: { select: { name: true, imageUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!artisan) redirect("/artisan-apply")
  // Defense-in-depth role guard.
  if (artisan.user.role !== "ARTISAN") redirect("/")

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reviews & Ratings</h1>
            <p className="text-slate-500 text-sm mt-1">See what customers are saying about your work.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <span className="font-bold text-slate-900 text-lg">{artisan.rating.toFixed(1)}</span>
            <StarDisplay rating={artisan.rating} />
            <span className="text-sm text-slate-500">({artisan.totalReviews})</span>
          </div>
        </div>

        {artisan.reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 text-center">
            <Star size={40} className="mx-auto text-slate-300 mb-4 fill-slate-100" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">No Reviews Yet</h2>
            <p className="text-slate-500 text-sm">
              Complete bookings to receive feedback from your customers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {artisan.reviews.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {r.customer.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.customer.imageUrl} className="w-10 h-10 rounded-full" alt={r.customer.name} />
                    ) : (
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-600">
                        {r.customer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{r.customer.name}</h3>
                      <span className="text-xs text-slate-400">
                        {r.createdAt.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <StarDisplay rating={r.rating} />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
