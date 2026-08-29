import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Star, CheckCircle, XCircle } from "lucide-react"
import ReviewForm from "./_review-form"

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50  text-amber-700  border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50    text-red-700    border-red-200",
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </span>
  )
}

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; failed?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { success, failed } = await searchParams

  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      artisan: { include: { user: { select: { name: true, imageUrl: true } } } },
      service: true,
      payment: true,
      review:  true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500 text-sm mb-6">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
            <CheckCircle size={16} />
            Payment successful! Your booking is confirmed.
          </div>
        )}
        {failed && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            <XCircle size={16} />
            Payment failed. Please try again.
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <User size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500 mb-4">No bookings yet.</p>
            <Link
              href="/customer/browse"
              className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Browse Artisans
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {b.artisan.user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.artisan.user.imageUrl}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                      alt={b.artisan.user.name}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <User size={20} className="text-emerald-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-semibold text-slate-900">{b.artisan.user.name}</div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">{b.service.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(b.date).toLocaleDateString("en-GH", {
                        weekday: "short", year: "numeric", month: "short",
                        day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-slate-900 text-sm">GHS {b.service.price}</div>
                      {b.payment && (
                        <div className={`text-xs font-medium ${b.payment.status === "SUCCESS" ? "text-emerald-600" : "text-slate-400"}`}>
                          {b.payment.status === "SUCCESS" ? "Paid" : `Payment: ${b.payment.status}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {b.status === "COMPLETED" && !b.review && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-sm font-medium text-slate-700 mb-3">Leave a review</p>
                    <ReviewForm bookingId={b.id} artisanUserId={b.artisan.userId} />
                  </div>
                )}

                {b.review && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-start gap-2 text-sm text-slate-500">
                    <StarDisplay rating={b.review.rating} />
                    <span className="italic">&ldquo;{b.review.comment}&rdquo;</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
