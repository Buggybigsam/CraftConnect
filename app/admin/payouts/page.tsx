import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import MarkPayoutPaid from "./_actions"

export default async function AdminPayoutsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const [payments, payouts] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      include: {
        booking: {
          include: { artisan: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
    }),
    prisma.artisanPayout.findMany(),
  ])

  const byArtisan = new Map<
    string,
    { artisanId: string; name: string; email: string; gross: number; commission: number; paid: number }
  >()

  for (const payment of payments) {
    const artisan = payment.booking.artisan
    const row = byArtisan.get(artisan.id) ?? {
      artisanId: artisan.id,
      name: artisan.user.name,
      email: artisan.user.email,
      gross: 0,
      commission: 0,
      paid: 0,
    }
    row.gross += payment.amount
    row.commission += payment.commissionAmount
    byArtisan.set(artisan.id, row)
  }

  for (const payout of payouts) {
    const row = byArtisan.get(payout.artisanId)
    if (row) row.paid += payout.amount
  }

  const rows = [...byArtisan.values()].map((row) => ({
    ...row,
    net: row.gross - row.commission,
    owed: row.gross - row.commission - row.paid,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payouts</h1>
        <p className="text-slate-500 text-sm mb-6">Platform commission vs. amounts owed to artisans.</p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Artisan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Gross</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Commission</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Net</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Paid</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Owed</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.artisanId}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-400">{row.email}</div>
                  </td>
                  <td className="px-5 py-3.5">GHS {row.gross.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-violet-600">GHS {row.commission.toFixed(2)}</td>
                  <td className="px-5 py-3.5">GHS {row.net.toFixed(2)}</td>
                  <td className="px-5 py-3.5">GHS {row.paid.toFixed(2)}</td>
                  <td className="px-5 py-3.5 font-semibold">GHS {row.owed.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <MarkPayoutPaid artisanId={row.artisanId} owed={row.owed} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No successful payments yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
