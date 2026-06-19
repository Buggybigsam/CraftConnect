import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ArtisanEarningsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId } })
  if (!artisan) redirect("/artisan-apply")

  const payments = await prisma.payment.findMany({
    where: { booking: { artisanId: artisan.id }, status: "SUCCESS" },
    include: { booking: { include: { customer: { select: { name: true } }, service: true } } },
    orderBy: { paidAt: "desc" },
  })

  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/artisan/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <Link href="/" className="text-xl font-bold text-blue-600 ml-2">SmartBooking</Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
          <div className="text-4xl font-bold text-green-700">GHS {total.toFixed(2)}</div>
          <div className="text-green-600 text-sm mt-1">Total earned</div>
        </div>
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">No payments yet.</div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border shadow-sm p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{p.booking.service.title}</div>
                  <div className="text-xs text-gray-500">{p.booking.customer.name}</div>
                  <div className="text-xs text-gray-400">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : ""}</div>
                </div>
                <div className="font-semibold text-green-600">+ GHS {p.amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
