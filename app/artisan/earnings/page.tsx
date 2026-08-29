import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TrendingUp, DollarSign, Calendar, User } from "lucide-react"

export default async function ArtisanEarningsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId } })
  if (!artisan) redirect("/artisan-apply")

  const payments = await prisma.payment.findMany({
    where:   { booking: { artisanId: artisan.id }, status: "SUCCESS" },
    include: { booking: { include: { customer: { select: { name: true } }, service: true } } },
    orderBy: { paidAt: "desc" },
  })

  const total      = payments.reduce((sum, p) => sum + p.amount, 0)
  const thisMonth  = payments.filter((p) => {
    if (!p.paidAt) return false
    const d = new Date(p.paidAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Earnings</h1>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm text-slate-500">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">GHS {total.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm text-slate-500">This Month</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">GHS {thisMonth.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <DollarSign size={16} className="text-amber-500" />
              </div>
              <span className="text-sm text-slate-500">Transactions</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{payments.length}</div>
          </div>
        </div>

        {/* Payment list */}
        <h2 className="font-semibold text-slate-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <DollarSign size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500 font-medium text-sm">No payments yet.</p>
            <p className="text-slate-400 text-xs mt-1">Completed bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <User size={15} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{p.booking.service.title}</div>
                    <div className="text-xs text-slate-500">{p.booking.customer.name}</div>
                    <div className="text-xs text-slate-400">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-emerald-600">+ GHS {p.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
