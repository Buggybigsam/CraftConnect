import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Clock,
  XCircle,
  CalendarCheck,
  TrendingUp,
  Star,
  UserPen,
  ArrowRight,
  Calendar,
  Phone,
  DollarSign,
} from "lucide-react"
import AvailabilityToggle from "./_availability-toggle"
import ArtisanBookingList from "./_booking-list"

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </span>
  )
}

export default async function ArtisanDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      reviews: {
        include: {
          customer: { select: { name: true, imageUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  })

  if (!artisan) redirect("/artisan-apply")

  if (artisan.status === "PENDING") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Application Under Review</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your artisan profile is being reviewed by our team. You&apos;ll receive an email once approved, usually within 24 hours.
          </p>
        </div>
      </div>
    )
  }

  if (artisan.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Application Not Approved</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your application was not approved. Please contact support for more information.
          </p>
          <Link href="/" className="text-emerald-600 hover:underline text-sm font-medium">Go home</Link>
        </div>
      </div>
    )
  }

  const bookings = await prisma.booking.findMany({
    where: { artisanId: artisan.id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const totalEarned = bookings
    .filter((b) => b.payment?.status === "SUCCESS")
    .reduce((sum, b) => sum + (b.payment?.amount ?? b.service.price), 0)

  const pending = bookings.filter((b) => b.status === "PENDING").length
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length

  // Filter confirmed jobs for this week (now until 7 days ahead)
  const now = new Date()
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingThisWeek = bookings.filter((b) => {
    if (b.status !== "CONFIRMED") return false
    const d = new Date(b.date)
    return d >= now && d <= weekAhead
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Serialize for Client Component
  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    date: b.date.toISOString(),
    notes: b.notes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    isNew: now.getTime() - b.createdAt.getTime() < 24 * 60 * 60 * 1000,
    customer: {
      name: b.customer.name,
      email: b.customer.email,
      phone: b.customer.phone,
    },
    service: {
      id: b.service.id,
      title: b.service.title,
      price: b.service.price,
      category: b.service.category,
    },
    payment: b.payment
      ? {
          id: b.payment.id,
          amount: b.payment.amount,
          currency: b.payment.currency,
          status: b.payment.status,
          reference: b.payment.reference,
          paidAt: b.payment.paidAt ? b.payment.paidAt.toISOString() : null,
        }
      : null,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome, {artisan.user.name.split(" ")[0]}
              </h1>
              {!artisan.isAvailable && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                  Paused
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {artisan.category} · {artisan.location} · GHS {artisan.pricePerHour}/hr
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <AvailabilityToggle initialAvailable={artisan.isAvailable} />

            <Link
              href="/artisan/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
            >
              <UserPen size={14} />
              Edit Profile
            </Link>

            <Link
              href="/artisan/earnings"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
            >
              <DollarSign size={14} />
              Earnings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-amber-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">Pending Requests</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{pending}</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CalendarCheck size={16} className="text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">Confirmed Jobs</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{confirmed}</div>
          </div>

          <Link
            href="/artisan/earnings"
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-slate-200 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-slate-500">Total Earned</span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-2xl font-bold text-slate-900">GHS {totalEarned.toFixed(0)}</div>
          </Link>
        </div>

        {/* Week View & Reputation Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Upcoming Jobs This Week Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Jobs This Week</h2>
                    <p className="text-[11px] text-slate-400">Next 7 days confirmed schedule</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                  {upcomingThisWeek.length}
                </span>
              </div>

              {upcomingThisWeek.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No confirmed jobs scheduled for the next 7 days.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingThisWeek.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{job.service.title}</div>
                        <div className="text-slate-500">{job.customer.name}</div>
                        {job.customer.phone && (
                          <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                            <Phone size={10} /> {job.customer.phone}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 inline-block">
                          {new Date(job.date).toLocaleDateString("en-GH", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {new Date(job.date).toLocaleTimeString("en-GH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ratings & Recent Reviews */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star size={16} className="fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Rating & Feedback</h2>
                    <p className="text-[11px] text-slate-400">Customer feedback and reviews</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-lg font-bold text-slate-900">{artisan.rating.toFixed(1)}</span>
                  <div className="flex flex-col items-end">
                    <StarDisplay rating={artisan.rating} />
                    <span className="text-[10px] text-slate-400">{artisan.totalReviews} review{artisan.totalReviews !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>

              {artisan.reviews.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No reviews yet. Completed jobs with customer feedback will appear here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {artisan.reviews.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{r.customer.name}</span>
                        <StarDisplay rating={r.rating} />
                      </div>
                      <p className="text-slate-600 italic">&ldquo;{r.comment}&rdquo;</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {r.createdAt.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Bookings List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">All Bookings</h2>
          <span className="text-xs text-slate-400">{bookings.length} total</span>
        </div>

        <ArtisanBookingList bookings={serializedBookings} />
      </div>
    </div>
  )
}
