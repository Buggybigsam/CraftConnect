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
      select: { name: true },
    }),
  ])

  // Compute stat strip
  const totalBookings = bookings.length
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
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={null}>
        <PaymentToast />
      </Suspense>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your artisan bookings, receipts, and saved professionals</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/customer/settings"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
            >
              <Settings size={14} />
              Settings
            </Link>
            <Link
              href="/customer/browse"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus size={14} />
              Book Artisan
            </Link>
          </div>
        </div>

        {/* 3-Card Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CalendarCheck size={16} className="text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">Total Bookings</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalBookings}</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">GHS {totalSpent.toFixed(0)}</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Award size={16} className="text-amber-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">Top Category</span>
            </div>
            <div className="text-lg font-bold text-slate-900 truncate" title={topCategory}>
              {topCategory}
            </div>
          </div>
        </div>

        {/* Saved Artisans Strip */}
        <SavedArtisansStrip savedArtisans={serializedSaved} />

        {/* Bookings Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">My Bookings</h2>
          <span className="text-xs text-slate-400">{totalBookings} total</span>
        </div>

        <CustomerBookingList
          bookings={serializedBookings}
          savedArtisanIds={savedArtisanIds}
        />
      </div>
    </div>
  )
}
