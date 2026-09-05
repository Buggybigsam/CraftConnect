import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  CalendarCheck,
  TrendingUp,
  Award,
  Settings,
  Plus,
  ArrowRight,
  Clock3,
  ShieldCheck,
} from "lucide-react"
import CustomerBookingList from "./_booking-list"
import SavedArtisansStrip from "./_saved-artisans-strip"
import PaymentToast from "./_payment-toast"

export default async function CustomerDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [bookings, savedArtisans, user] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        artisan: {
          include: {
            user: { select: { name: true, imageUrl: true, phone: true } },
          },
        },
        service: true,
        payment: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedArtisan.findMany({
      where: { customerId: userId },
      include: {
        artisan: {
          include: {
            user: { select: { name: true, imageUrl: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true },
    }),
  ])

  // Defense-in-depth role guard: if user isn't in DB yet, initialize via /auth/redirect
  if (!user) redirect("/auth/redirect")
  if (user.role === "ARTISAN") redirect("/artisan/dashboard")
  if (user.role === "ADMIN") redirect("/admin/dashboard")

  // Compute stat strip
  const totalBookings = bookings.length
  const upcomingBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED").length
  const totalSpent = bookings
    .filter((b) => b.payment?.status === "SUCCESS")
    .reduce((sum, b) => sum + (b.payment?.amount ?? b.service.price), 0)

  const categoryCounts: Record<string, number> = {}
  bookings.forEach((b) => {
    const cat = b.service.category || b.artisan.category
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  })
  let topCategory = "None yet"
  let maxCount = 0
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count
      topCategory = cat
    }
  }

  const savedArtisanIds = savedArtisans.map((s) => s.artisanId)

  // Serialize for Client Component
  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    customerId: b.customerId,
    artisanId: b.artisanId,
    serviceId: b.serviceId,
    date: b.date.toISOString(),
    notes: b.notes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    artisan: {
      id: b.artisan.id,
      userId: b.artisan.userId,
      category: b.artisan.category,
      location: b.artisan.location,
      user: {
        name: b.artisan.user.name,
        imageUrl: b.artisan.user.imageUrl,
        phone: b.artisan.user.phone,
      },
    },
    service: {
      id: b.service.id,
      title: b.service.title,
      description: b.service.description,
      price: b.service.price,
      category: b.service.category,
    },
    payment: b.payment
      ? {
          id: b.payment.id,
          amount: b.payment.amount,
          currency: b.payment.currency,
          reference: b.payment.reference,
          status: b.payment.status,
          paidAt: b.payment.paidAt ? b.payment.paidAt.toISOString() : null,
        }
      : null,
    review: b.review
      ? {
          id: b.review.id,
          rating: b.review.rating,
          comment: b.review.comment,
          createdAt: b.review.createdAt.toISOString(),
        }
      : null,
  }))

  const serializedSaved = savedArtisans.map((s) => ({
    id: s.id,
    artisanId: s.artisanId,
    artisan: {
      id: s.artisan.id,
      userId: s.artisan.userId,
      category: s.artisan.category,
      location: s.artisan.location,
      rating: s.artisan.rating,
      pricePerHour: s.artisan.pricePerHour,
      user: {
        name: s.artisan.user.name,
        imageUrl: s.artisan.user.imageUrl,
        phone: s.artisan.user.phone,
      },
    },
  }))

  const firstName = user?.name ? user.name.split(" ")[0] : "there"

  return (
    <div className="min-h-screen bg-slate-100/70">
      <Suspense fallback={null}>
        <PaymentToast />
      </Suspense>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
            <div className="p-6 sm:p-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={14} />
                Verified artisan network
              </div>
              <h1 className="max-w-2xl text-2xl font-bold text-slate-950 sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Track upcoming work, review completed bookings, and keep your trusted professionals close.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/customer/browse"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Plus size={15} />
                  Book Artisan
                </Link>
                <Link
                  href="/customer/settings"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings size={15} />
                  Account Settings
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarCheck size={14} className="text-emerald-600" />
                    Total
                  </div>
                  <div className="mt-3 text-3xl font-bold text-slate-950">{totalBookings}</div>
                  <p className="mt-1 text-xs text-slate-500">bookings</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Clock3 size={14} className="text-blue-600" />
                    Upcoming
                  </div>
                  <div className="mt-3 text-3xl font-bold text-slate-950">{upcomingBookings}</div>
                  <p className="mt-1 text-xs text-slate-500">scheduled</p>
                </div>
                <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <TrendingUp size={14} className="text-emerald-600" />
                        Paid Spend
                      </div>
                      <div className="mt-3 text-2xl font-bold text-slate-950">GHS {totalSpent.toFixed(0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Award size={14} className="text-amber-500" />
                        Top Category
                      </div>
                      <div className="mt-3 max-w-36 truncate text-sm font-bold text-slate-950" title={topCategory}>
                        {topCategory}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Artisans Strip */}
        <SavedArtisansStrip savedArtisans={serializedSaved} />

        {/* Bookings Section */}
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">My Bookings</h2>
            <p className="text-sm text-slate-500">Recent activity across all booked services</p>
          </div>
          <Link href="/customer/browse" className="hidden items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-950 sm:inline-flex">
            Browse artisans <ArrowRight size={14} />
          </Link>
        </div>

        <CustomerBookingList
          bookings={serializedBookings}
          savedArtisanIds={savedArtisanIds}
        />
      </div>
    </div>
  )
}
