import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50  text-amber-700  border-amber-100",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50    text-red-700    border-red-100",
}

const PAYMENT_STYLES: Record<string, string> = {
  SUCCESS: "text-emerald-600 font-semibold",
  PENDING: "text-amber-500",
  FAILED:  "text-red-500",
}

export default async function AdminBookingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const bookings = await prisma.booking.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      artisan:  { include: { user: { select: { name: true } } } },
      service:  true,
      payment:  true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const revenue = bookings
    .filter((b) => b.payment?.status === "SUCCESS")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm transition">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-slate-900">SmartBooking Admin</span>
          </div>
          <Link href="/admin/users" className="text-sm text-slate-600 hover:text-slate-900 transition">Users</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Bookings</h1>
            <p className="text-slate-500 text-sm mt-1">
              {bookings.length} total · GHS {revenue.toFixed(0)} revenue collected
            </p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <CalendarDays size={18} className="text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Artisan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {b.payment ? (
                      <div>
                        <span className={`text-xs ${PAYMENT_STYLES[b.payment.status]}`}>
                          GHS {b.payment.amount}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">· {b.payment.status}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No bookings yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
