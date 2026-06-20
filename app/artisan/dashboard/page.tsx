import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Clock, Phone, CheckCircle, XCircle, DollarSign, CalendarCheck, TrendingUp } from "lucide-react"
import ArtisanBookingActions from "./_actions"

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50  text-amber-700  border-amber-100",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50    text-red-700    border-red-100",
}

export default async function ArtisanDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
    include: { user: true },
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
            Your artisan profile is being reviewed by our team. You&apos;ll receive an email once approved — usually within 24 hours.
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
          <Link href="/" className="text-indigo-600 hover:underline text-sm font-medium">Go home</Link>
        </div>
      </div>
    )
  }

  const bookings = await prisma.booking.findMany({
    where:   { artisanId: artisan.id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      service:  true,
      payment:  true,
    },
    orderBy: { createdAt: "desc" },
  })

  const totalEarned = bookings
    .filter((b) => b.payment?.status === "SUCCESS")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0)

  const pending   = bookings.filter((b) => b.status === "PENDING").length
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {artisan.user.name.split(" ")[0]}</h1>
          <p className="text-slate-500 text-sm mt-1">{artisan.category} · {artisan.location}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-amber-500" />
              </div>
              <span className="text-sm text-slate-500">Pending</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{pending}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <CalendarCheck size={16} className="text-indigo-500" />
              </div>
              <span className="text-sm text-slate-500">Confirmed</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{confirmed}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm text-slate-500">Earned</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">GHS {totalEarned.toFixed(0)}</div>
          </div>
        </div>

        {/* Bookings */}
        <h2 className="font-semibold text-slate-900 mb-4">All Bookings</h2>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <CheckCircle size={32} className="mx-auto mb-3 text-emerald-300" />
            <p className="text-slate-500 text-sm font-medium">Your profile is live!</p>
            <p className="text-slate-400 text-xs mt-1">Bookings will appear here once customers start booking you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{b.customer.name}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{b.service.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(b.date).toLocaleDateString("en-GH", {
                        weekday: "short", year: "numeric", month: "short",
                        day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                    {b.customer.phone && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Phone size={11} /> {b.customer.phone}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-900 mt-2 justify-end">
                      <DollarSign size={13} className="text-slate-400" />
                      GHS {b.service.price}
                    </div>
                  </div>
                </div>
                {b.status === "PENDING" && (
                  <ArtisanBookingActions bookingId={b.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
