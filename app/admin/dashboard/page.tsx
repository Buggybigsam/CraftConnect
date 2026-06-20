import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { MapPin, Briefcase, DollarSign } from "lucide-react"
import AdminArtisanActions from "./_actions"

export default async function AdminDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "ADMIN") redirect("/")

  const [pendingArtisans, totalUsers, totalBookings, totalRevenue] = await Promise.all([
    prisma.artisanProfile.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600">{totalUsers}</div>
            <div className="text-sm text-slate-500 mt-1">Total Users</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <div className="text-3xl font-bold text-violet-600">{totalBookings}</div>
            <div className="text-sm text-slate-500 mt-1">Total Bookings</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <div className="text-3xl font-bold text-amber-500">{pendingArtisans.length}</div>
            <div className="text-sm text-slate-500 mt-1">Pending Applications</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <div className="text-2xl font-bold text-emerald-600">
              GHS {(totalRevenue._sum.amount ?? 0).toFixed(0)}
            </div>
            <div className="text-sm text-slate-500 mt-1">Total Revenue</div>
          </div>
        </div>

        {/* Pending artisan applications */}
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          Pending Artisan Applications
          {pendingArtisans.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {pendingArtisans.length}
            </span>
          )}
        </h2>

        {pendingArtisans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
            All caught up — no pending applications.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingArtisans.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{a.user.name}</div>
                    <div className="text-sm text-indigo-600 font-medium">{a.category}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={11} />{a.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{a.yearsExp} yrs exp</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} />GHS {a.pricePerHour}/hr</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{a.bio}</p>
                    <div className="text-xs text-slate-400 mt-1">{a.user.email} · {a.user.phone}</div>
                  </div>
                </div>
                <AdminArtisanActions artisanProfileId={a.id} artisanEmail={a.user.email} artisanName={a.user.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
