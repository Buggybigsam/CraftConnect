import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { AdminPagination } from "@/components/ui/admin-pagination"
import { ADMIN_PAGE_SIZE, parsePage, buildSearchQuery } from "@/lib/admin-query"
import type { BookingStatus, Prisma } from "@/lib/generated/prisma/client"
import AdminBookingActions from "./_actions"

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50  text-amber-700  border-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50    text-red-700    border-red-100",
}

const PAYMENT_STYLES: Record<string, string> = {
  SUCCESS: "text-emerald-600 font-semibold",
  PENDING: "text-amber-500",
  FAILED:  "text-red-500",
  REFUNDED: "text-slate-500",
}
const PAYMENT_FALLBACK_STYLE = "text-slate-400"

const BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const status = BOOKING_STATUSES.includes(params.status as BookingStatus)
    ? (params.status as BookingStatus)
    : undefined
  const page = parsePage(params.page)
  const skip = (page - 1) * ADMIN_PAGE_SIZE

  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { customer: { name: { contains: q, mode: "insensitive" } } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { artisan: { user: { name: { contains: q, mode: "insensitive" } } } },
            { service: { title: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  }

  const [totalCount, bookings, volumeAgg, artisans] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        artisan:  { include: { user: { select: { name: true } } } },
        service:  true,
        payment:  true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.artisanProfile.findMany({
      where: { status: "APPROVED" },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const qs = (p: number) => `/admin/bookings${buildSearchQuery({ q, status }, p)}`
  const artisanOptions = artisans.map((a) => ({ id: a.id, name: a.user.name }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Bookings</h1>
            <p className="text-slate-500 text-sm mt-1">
              {totalCount} matching · GHS {(volumeAgg._sum.amount ?? 0).toFixed(0)} gross volume collected
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CalendarDays size={18} className="text-emerald-600" />
          </div>
        </div>

        <form method="get" className="flex flex-wrap gap-2 mb-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="flex-1 min-w-48 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
          />
          <select name="status" defaultValue={status ?? ""} className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800">
            Filter
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Artisan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{b.customer.name}</div>
                    <div className="text-xs text-slate-400">{b.customer.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{b.artisan.user.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.service.title}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {new Date(b.date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge value={b.status} styles={STATUS_STYLES} />
                  </td>
                  <td className="px-5 py-3.5">
                    {b.payment ? (
                      <div>
                        <span className={`text-xs ${PAYMENT_STYLES[b.payment.status] ?? PAYMENT_FALLBACK_STYLE}`}>
                          GHS {b.payment.amount}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">· {b.payment.status}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminBookingActions
                      booking={{
                        id: b.id,
                        status: b.status,
                        paymentStatus: b.payment?.status,
                        artisans: artisanOptions,
                        currentArtisanId: b.artisanId,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-slate-50">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{b.customer.name}</div>
                    <div className="text-xs text-slate-400">{b.customer.email}</div>
                  </div>
                  <StatusBadge value={b.status} styles={STATUS_STYLES} className="shrink-0" />
                </div>
                <div className="text-sm text-slate-700">{b.service.title} · {b.artisan.user.name}</div>
                <AdminBookingActions
                  booking={{
                    id: b.id,
                    status: b.status,
                    paymentStatus: b.payment?.status,
                    artisans: artisanOptions,
                    currentArtisanId: b.artisanId,
                  }}
                />
              </div>
            ))}
          </div>

          {bookings.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No bookings match these filters.</div>
          )}

          <AdminPagination
            page={currentPage}
            totalPages={totalPages}
            total={totalCount}
            pageSize={ADMIN_PAGE_SIZE}
            hrefForPage={qs}
          />
        </div>
      </div>
    </div>
  )
}
