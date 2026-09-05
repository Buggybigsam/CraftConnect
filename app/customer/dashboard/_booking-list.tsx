"use client"

import { useState } from "react"
import Link from "next/link"
import {
  User,
  Star,
  Phone,
  MessageCircle,
  Receipt,
  RotateCcw,
  Calendar,
  Layers,
} from "lucide-react"
import CustomerBookingActions from "./_booking-actions"
import SavedArtisanButton from "./_saved-artisan-button"
import ReviewForm from "./_review-form"
import { getArtisanPhoto } from "@/lib/artisan-categories"

interface BookingItem {
  id: string
  customerId: string
  artisanId: string
  serviceId: string
  date: string
  notes: string | null
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  createdAt: string
  artisan: {
    id: string
    userId: string
    category: string
    location: string
    user: {
      name: string
      imageUrl: string | null
      phone: string | null
    }
  }
  service: {
    id: string
    title: string
    description: string
    price: number
    category: string
  }
  payment: {
    id: string
    amount: number
    currency: string
    reference: string
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
    paidAt: string | null
  } | null
  review: {
    id: string
    rating: number
    comment: string
    createdAt: string
  } | null
}

const STATUS_STYLES: Record<BookingItem["status"], string> = {
  PENDING:   "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
}

type TabKey = "UPCOMING" | "COMPLETED" | "CANCELLED" | "ALL"

interface Props {
  bookings: BookingItem[]
  savedArtisanIds: string[]
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </span>
  )
}

export default function CustomerBookingList({ bookings, savedArtisanIds }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL")
  const [displayCount, setDisplayCount] = useState(10)

  const filtered = bookings.filter((b) => {
    if (activeTab === "UPCOMING") return b.status === "PENDING" || b.status === "CONFIRMED"
    if (activeTab === "COMPLETED") return b.status === "COMPLETED"
    if (activeTab === "CANCELLED") return b.status === "CANCELLED"
    return true
  })

  const visibleBookings = filtered.slice(0, displayCount)
  const upcomingCount = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED").length
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "ALL", label: "All", count: bookings.length },
    { key: "UPCOMING", label: "Upcoming", count: upcomingCount },
    { key: "COMPLETED", label: "Completed", count: completedCount },
    { key: "CANCELLED", label: "Cancelled", count: cancelledCount },
  ]

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto sm:max-w-xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key)
              setDisplayCount(10)
            }}
            className={`min-h-9 shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeTab === tab.key
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Layers size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">
            No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} bookings found.
          </p>
          <p className="mt-1 mb-4 text-xs text-slate-400">Explore top-rated local artisans ready to help.</p>
          <Link
            href="/customer/browse"
            className="inline-flex min-h-9 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
          >
            Browse Artisans
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((b) => {
            const rawPhone = b.artisan.user.phone || ""
            const cleanPhone = rawPhone.replace(/\D/g, "")
            const isSaved = savedArtisanIds.includes(b.artisan.id)
            const artisanPhoto = getArtisanPhoto(
              b.artisan.user.name,
              b.service.category || b.artisan.category,
            )

            return (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {artisanPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artisanPhoto}
                      className="h-16 w-16 shrink-0 rounded-xl border border-slate-100 object-cover"
                      alt={`${b.artisan.category} artisan ${b.artisan.user.name}`}
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <User size={22} className="text-emerald-600" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Link
                          href={`/customer/artisan/${b.artisan.userId}`}
                          className="font-semibold text-slate-950 transition hover:text-emerald-700"
                        >
                          {b.artisan.user.name}
                        </Link>
                        <span className="text-xs text-slate-400">- {b.artisan.category}</span>
                        <SavedArtisanButton artisanId={b.artisan.id} isSaved={isSaved} />
                      </div>

                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-1 text-sm font-medium text-slate-700">{b.service.title}</div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(b.date).toLocaleDateString("en-GH", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {b.artisan.location && <span>{b.artisan.location}</span>}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-slate-950">GHS {b.service.price}</div>
                        {b.payment && (
                          <div className={`text-xs font-semibold ${
                            b.payment.status === "SUCCESS"
                              ? "text-emerald-600"
                              : b.payment.status === "REFUNDED"
                                ? "text-blue-600"
                                : "text-slate-400"
                          }`}>
                            {b.payment.status === "SUCCESS"
                              ? "Paid"
                              : b.payment.status === "REFUNDED"
                                ? "Refunded"
                                : `Payment: ${b.payment.status}`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {b.artisan.user.phone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${b.artisan.user.name}, I am contacting you regarding my booking for "${b.service.title}".`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={12} />
                              WhatsApp
                            </a>
                            <a
                              href={`tel:${b.artisan.user.phone}`}
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                              title="Call Artisan"
                            >
                              <Phone size={12} />
                              Call
                            </a>
                          </div>
                        )}

                        {b.payment?.status === "SUCCESS" && (
                          <Link
                            href={`/customer/dashboard/receipt/${b.id}`}
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            <Receipt size={12} />
                            Receipt
                          </Link>
                        )}

                        {b.status === "COMPLETED" && (
                          <Link
                            href={`/customer/booking/${b.artisan.userId}`}
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800"
                          >
                            <RotateCcw size={12} />
                            Book Again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <CustomerBookingActions
                    bookingId={b.id}
                    status={b.status}
                    currentDate={b.date}
                  />
                )}

                {b.status === "COMPLETED" && !b.review && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-semibold text-slate-700">Leave a review for {b.artisan.user.name}</p>
                    <ReviewForm bookingId={b.id} artisanUserId={b.artisan.userId} />
                  </div>
                )}

                {b.review && (
                  <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <StarDisplay rating={b.review.rating} />
                    <span className="italic">&ldquo;{b.review.comment}&rdquo;</span>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length > displayCount && (
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 10)}
                className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
              >
                Load More Bookings ({filtered.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
