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
  AlertCircle,
  ShieldCheck,
  MapPin,
  Briefcase,
  MessageSquare,
  Plus,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import AvailabilityToggle from "./_availability-toggle"

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-slate-300"}
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
      services: { take: 4 },
    },
  })

  if (!artisan) redirect("/artisan-apply")
  // Defense-in-depth role guard.
  if (artisan.user.role !== "ARTISAN") redirect("/")

  if (artisan.status === "PENDING") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200/60 shadow-xs">
            <Clock size={28} className="text-amber-600 animate-pulse" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-3">
            Status: Pending Review
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">Application Under Review</h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Your artisan profile is currently being reviewed by the CraftConnect verification team. You will receive an email once approved, typically within 24 hours.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 text-left space-y-2">
            <p className="font-semibold text-slate-700">What happens next?</p>
            <p>✓ Credentials & experience verified</p>
            <p>✓ Profile listed on the Ghana artisan marketplace</p>
            <p>✓ Direct booking alerts sent to your phone</p>
          </div>
        </div>
      </div>
    )
  }

  if (artisan.status === "REJECTED") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-200">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Application Not Approved</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your application could not be approved at this time. Please contact support for feedback or resubmit.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition">
            Back to Homepage
          </Link>
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
  const completed = bookings.filter((b) => b.status === "COMPLETED").length

  // Filter confirmed jobs for this week (now until 7 days ahead)
  const now = new Date()
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingThisWeek = bookings.filter((b) => {
    if (b.status !== "CONFIRMED") return false
    const d = new Date(b.date)
    return d >= now && d <= weekAhead
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const isProfileIncomplete = artisan.services.length === 0 || !artisan.workingHours
  const checklist = []
  if (artisan.services.length === 0) checklist.push("Add your first service listing")
  if (!artisan.workingHours) checklist.push("Set your regular working hours & availability")

  const firstName = artisan.user.name.split(" ")[0] || "Artisan"

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Profile Completion Alert */}
        {isProfileIncomplete && (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-300">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-amber-950 text-sm">Action Required: Complete Profile Setup</h3>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full">
                    Setup Incomplete
                  </span>
                </div>
                <p className="text-amber-800 text-xs mt-0.5">Finish these quick steps so clients can view and book your services:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-amber-900">
                  {checklist.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/artisan/settings"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Complete Setup</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Hero Pro Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-extrabold text-2xl text-emerald-400">
                  {firstName.charAt(0)}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome, {firstName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={12} />
                    Verified Partner
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={13} className="text-emerald-400" />
                    <span className="font-semibold text-white">{artisan.category}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <MapPin size={13} />
                    {artisan.location}
                  </span>
                  <span className="text-emerald-300 font-bold">
                    GHS {artisan.pricePerHour}/hr base rate
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Switcher */}
            <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
              <AvailabilityToggle initialAvailable={artisan.isAvailable} />

              <Link
                href="/artisan/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition shadow-sm"
              >
                <UserPen size={14} />
                Edit Profile
              </Link>

              <Link
                href="/artisan/earnings"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-sm shadow-emerald-950"
              >
                <DollarSign size={14} />
                Earnings
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Card KPI Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Paid Earned</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              GHS {totalEarned.toFixed(0)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">{completed} completed jobs</span>
              <Link href="/artisan/earnings" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5">
                Details <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 2: Confirmed Schedule */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed Jobs</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarCheck size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {confirmed}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">{upcomingThisWeek.length} scheduled this week</span>
              <Link href="/artisan/bookings" className="text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5">
                View <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 3: Pending Leads */}
          <div className={`rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all ${
            pending > 0
              ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/60"
              : "bg-white border-slate-200/80"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Requests</span>
                {pending > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pending}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={pending > 0 ? "text-amber-800 font-semibold" : "text-slate-500"}>
                {pending > 0 ? "Response required" : "All caught up"}
              </span>
              <Link href="/artisan/bookings" className="text-amber-800 font-bold hover:underline inline-flex items-center gap-0.5">
                Review <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 4: Reviews & Rating */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reputation</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star size={16} className="fill-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {artisan.rating.toFixed(1)}
              </span>
              <StarDisplay rating={artisan.rating} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">{artisan.totalReviews} customer review{artisan.totalReviews !== 1 ? "s" : ""}</span>
              <Link href="/artisan/reviews" className="text-slate-800 font-bold hover:underline inline-flex items-center gap-0.5">
                Feedback <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Two-Column Command Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Span 2): Upcoming Schedule & Live Pipeline */}
          <div className="lg:col-span-2 space-y-6">

            {/* Jobs This Week Timeline Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Weekly Schedule Timeline</h2>
                    <p className="text-xs text-slate-500">Upcoming confirmed jobs for the next 7 days</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                  {upcomingThisWeek.length} Job{upcomingThisWeek.length !== 1 ? "s" : ""}
                </span>
              </div>

              {upcomingThisWeek.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <CalendarCheck size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No jobs scheduled this week</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    When customers book your services and payments are verified, your schedule will populate here automatically.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {upcomingThisWeek.map((job) => {
                    const jobDate = new Date(job.date)
                    return (
                      <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div className="flex items-start gap-3.5">
                          {/* Date Chip */}
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-800 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold uppercase leading-none">
                              {jobDate.toLocaleDateString("en-GH", { weekday: "short" })}
                            </span>
                            <span className="text-base font-black leading-none mt-1">
                              {jobDate.getDate()}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                {job.service.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                CONFIRMED
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              Client: {job.customer.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} />
                                {jobDate.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {job.customer.phone && (
                                <a
                                  href={`tel:${job.customer.phone}`}
                                  className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-semibold"
                                >
                                  <Phone size={11} /> {job.customer.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                          <span className="text-sm font-black text-slate-900">
                            GHS {job.payment?.amount ?? job.service.price}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Paid via Paystack
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Bookings Quick Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Recent Customer Bookings</h2>
                  <p className="text-xs text-slate-500">Live booking queue and historical requests</p>
                </div>
                <Link
                  href="/artisan/bookings"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  <span>Manage All ({bookings.length})</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No bookings received yet. Share your profile or make sure you are marked as &ldquo;Available&rdquo;.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings.slice(0, 4).map((b) => (
                    <div key={b.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {b.customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{b.customer.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{b.service.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : b.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          GHS {b.service.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Quick Launch, Reviews Spotlight & Profile Visibility */}
          <div className="space-y-6">

            {/* Fast Launch Action Hub */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                Quick Launch Actions
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  href="/artisan/services"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                      <Plus size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Add New Service</p>
                      <p className="text-[11px] text-slate-500">Add trade pricing and descriptions</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/artisan/availability"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Set Working Hours</p>
                      <p className="text-[11px] text-slate-500">Configure days & time availability</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/artisan/messages"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Client Inquiries</p>
                      <p className="text-[11px] text-slate-500">Direct questions from customers</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/artisan/profile"
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                      <ExternalLink size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Public Marketplace Profile</p>
                      <p className="text-[11px] text-slate-500">See how clients view your page</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>

            {/* Ratings & Customer Reviews Spotlight */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star size={16} className="fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">Client Feedback</h2>
                    <p className="text-[11px] text-slate-400">Verified service reviews</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-slate-900">{artisan.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-slate-400 font-medium">/ 5.0</span>
                </div>
              </div>

              {artisan.reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No customer reviews yet. Ratings and testimonials will appear here as soon as clients review your finished work.
                </div>
              ) : (
                <div className="space-y-3">
                  {artisan.reviews.map((r) => (
                    <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {r.customer.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{r.customer.name}</span>
                        </div>
                        <StarDisplay rating={r.rating} />
                      </div>
                      <p className="text-slate-600 italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                      <span className="text-[10px] text-slate-400 block mt-2">
                        {r.createdAt.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Visibility & Badge Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-5 border border-emerald-800/40 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Marketplace Status
                </span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>

              <p className="text-sm font-bold text-white">Listed in {artisan.category}</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your profile is indexed across {artisan.location} for prospective clients looking for verified professionals.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Services Listed:</span>
                <span className="font-bold text-emerald-300">{artisan.services.length} active</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
