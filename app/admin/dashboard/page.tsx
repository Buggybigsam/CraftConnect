import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Wallet,
  ScrollText,
  Star,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react"
import AdminArtisanActions from "./_actions"

export default async function AdminDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "ADMIN") redirect("/")

  const [
    pendingArtisans,
    totalUsers,
    totalBookings,
    volumeAgg,
    commissionAgg,
    customerCount,
    artisanCount,
    completedBookings,
    recentBookings,
  ] = await Promise.all([
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
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { commissionAmount: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "ARTISAN" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.findMany({
      include: {
        customer: { select: { name: true } },
        artisan: { include: { user: { select: { name: true } } } },
        service: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const grossVolume = volumeAgg._sum.amount ?? 0
  const platformRevenue = commissionAgg._sum.commissionAmount ?? 0
  const firstName = user.name.split(" ")[0] || "Admin"

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Executive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck size={28} className="text-emerald-400" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome, {firstName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={12} />
                    Admin Partner
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Activity size={13} className="text-emerald-400" />
                    <span className="font-semibold text-white">Platform Command Center</span>
                  </span>
                  <span>{totalUsers} registered users</span>
                  <span className="text-emerald-300 font-bold">{totalBookings} bookings processed</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
              <Link
                href="/admin/artisans"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-sm shadow-emerald-950"
              >
                <Briefcase size={14} />
                Review Applications
              </Link>
              <Link
                href="/admin/audit-log"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition shadow-sm"
              >
                <ScrollText size={14} />
                Audit Log
              </Link>
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition shadow-sm"
              >
                <Settings size={14} />
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* 5-Card KPI Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Platform Revenue */}
          <Link
            href="/admin/payouts"
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              GHS {platformRevenue.toFixed(0)}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Commission earned</span>
              <ChevronRight size={12} className="text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
          </Link>

          {/* Gross Volume */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Volume</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              GHS {grossVolume.toFixed(0)}
            </div>
            <div className="mt-2 text-xs text-slate-400">Total Paystack transactions</div>
          </div>

          {/* Total Users */}
          <Link
            href="/admin/users"
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalUsers}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-3">
              <span>{customerCount} customers</span>
              <span className="text-slate-300">·</span>
              <span>{artisanCount} artisans</span>
            </div>
          </Link>

          {/* Total Bookings */}
          <Link
            href="/admin/bookings"
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarDays size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalBookings}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>{completedBookings} completed</span>
              <ChevronRight size={12} className="text-slate-400 group-hover:text-indigo-600 transition" />
            </div>
          </Link>

          {/* Pending Approvals */}
          <Link
            href="/admin/artisans"
            className={`rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all group ${
              pendingArtisans.length > 0
                ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/60"
                : "bg-white border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Approval</span>
                {pendingArtisans.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {pendingArtisans.length}
            </div>
            <div className="mt-2 text-xs flex items-center justify-between">
              <span className={pendingArtisans.length > 0 ? "text-amber-800 font-semibold" : "text-slate-400"}>
                {pendingArtisans.length > 0 ? "Action required" : "All reviewed"}
              </span>
              <ChevronRight size={12} className="text-slate-400 group-hover:text-amber-700 transition" />
            </div>
          </Link>
        </div>

        {/* Two-Column Command Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Applications Queue & Recent Bookings */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pending Applications Queue */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Artisan Applications</h2>
                    <p className="text-xs text-slate-500">New artisan registration applications pending review</p>
                  </div>
                </div>
                {pendingArtisans.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                    {pendingArtisans.length} Pending
                  </span>
                )}
              </div>

              {pendingArtisans.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <CheckCircle2 size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending artisan applications to review.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {pendingArtisans.map((a) => (
                    <div key={a.id} className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {a.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-900">{a.user.name}</h3>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                {a.category}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={12} /> {a.location}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Briefcase size={12} /> {a.yearsExp} yrs experience
                              </span>
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                <DollarSign size={12} /> GHS {a.pricePerHour}/hr
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{a.bio}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{a.user.email} · {a.user.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-14">
                        <AdminArtisanActions artisanProfileId={a.id} artisanEmail={a.user.email} artisanName={a.user.name} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Platform Bookings */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Recent Platform Bookings</h2>
                  <p className="text-xs text-slate-500">Live stream of marketplace activity</p>
                </div>
                <Link
                  href="/admin/bookings"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No bookings in the system yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {b.customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {b.customer.name} → {b.artisan.user.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{b.service.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : b.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {b.service.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Quick Actions & Insights */}
          <div className="space-y-6">

            {/* Quick Management Actions */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                Admin Quick Actions
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  href="/admin/users"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">User Management</p>
                      <p className="text-[11px] text-slate-500">{totalUsers} registered accounts</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/admin/payouts"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                      <Wallet size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Payouts & Escrow</p>
                      <p className="text-[11px] text-slate-500">Transaction settlements</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/admin/reviews"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                      <Star size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Reviews Moderation</p>
                      <p className="text-[11px] text-slate-500">Customer feedback oversight</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/admin/audit-log"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                      <ScrollText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Audit & Security Logs</p>
                      <p className="text-[11px] text-slate-500">Platform activity ledger</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>

            {/* Platform Trust & Safety Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-5 border border-emerald-800/40 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Trust & Safety
                </span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>

              <p className="text-sm font-bold text-white">Platform Overview</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {artisanCount} verified artisan{artisanCount !== 1 ? "s" : ""} serving {customerCount} customers across Ghana. All transactions processed via Paystack with commission escrow.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Commission Rate</span>
                  <span className="font-bold text-emerald-300">Platform Default</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Payment Gateway</span>
                  <span className="font-bold text-emerald-300">Paystack ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Authentication</span>
                  <span className="font-bold text-emerald-300">Clerk active</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
