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
    status: "PENDING" | "SUCCESS" | "FAILED"
    paidAt: string | null
  } | null
  review: {
    id: string
    rating: number
    comment: string
    createdAt: string
  } | null
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50  text-amber-700  border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50    text-red-700    border-red-200",
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
          className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </span>
  )
}

export default function CustomerBookingList({ bookings, savedArtisanIds }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL")
  const [displayCount, setDisplayCount] = useState(10)

  // Filter bookings according to active tab
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

  return (
    <div className="space-y-4">
      {/* Segmented control / Status Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => { setActiveTab("ALL"); setDisplayCount(10) }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("UPCOMING"); setDisplayCount(10) }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === "UPCOMING" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("COMPLETED"); setDisplayCount(10) }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === "COMPLETED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("CANCELLED"); setDisplayCount(10) }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === "CANCELLED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Layers size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 font-medium text-sm">No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} bookings found.</p>
          <p className="text-slate-400 text-xs mt-1 mb-4">Explore top-rated local artisans ready to help.</p>
          <Link
            href="/customer/browse"
            className="inline-block bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-medium hover:bg-emerald-700 transition shadow-xs"
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

            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:border-slate-200">
                <div className="flex items-start gap-4">
                  {b.artisan.user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.artisan.user.imageUrl}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-100"
                      alt={b.artisan.user.name}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <User size={22} className="text-emerald-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/customer/artisan/${b.artisan.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 transition"
                        >
                          {b.artisan.user.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-normal">· {b.artisan.category}</span>
                        <SavedArtisanButton artisanId={b.artisan.id} isSaved={isSaved} />
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-700 mt-1">{b.service.title}</div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
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
                      {b.artisan.location && <span>• {b.artisan.location}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-slate-900 text-sm">GHS {b.service.price}</div>
                        {b.payment && (
                          <div className={`text-xs font-medium ${b.payment.status === "SUCCESS" ? "text-emerald-600" : "text-slate-400"}`}>
                            {b.payment.status === "SUCCESS" ? "● Paid" : `Payment: ${b.payment.status}`}
                          </div>
                        )}
                      </div>

                      {/* Action Links & Affordances */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Contact Artisan (WhatsApp / Phone) */}
                        {b.artisan.user.phone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${b.artisan.user.name}, I am contacting you regarding my booking for "${b.service.title}".`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={12} />
                              WhatsApp
                            </a>
                            <a
                              href={`tel:${b.artisan.user.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                              title="Call Artisan"
                            >
                              <Phone size={12} />
                              Call
                            </a>
                          </div>
                        )}

                        {/* View Receipt */}
                        {b.payment?.status === "SUCCESS" && (
                          <Link
                            href={`/customer/dashboard/receipt/${b.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            <Receipt size={12} />
                            Receipt
                          </Link>
                        )}

                        {/* Book Again on COMPLETED */}
                        {b.status === "COMPLETED" && (
                          <Link
                            href={`/customer/booking/${b.artisan.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs"
                          >
                            <RotateCcw size={12} />
                            Book Again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel / Reschedule actions for PENDING/CONFIRMED */}
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <CustomerBookingActions
                    bookingId={b.id}
                    status={b.status}
                    currentDate={b.date}
                  />
                )}

                {/* Reviews */}
                {b.status === "COMPLETED" && !b.review && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-xs font-medium text-slate-700 mb-2">Leave a review for {b.artisan.user.name}</p>
                    <ReviewForm bookingId={b.id} artisanUserId={b.artisan.userId} />
                  </div>
                )}

                {b.review && (
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-2 text-xs text-slate-500">
                    <StarDisplay rating={b.review.rating} />
                    <span className="italic">&ldquo;{b.review.comment}&rdquo;</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Load More Button */}
          {filtered.length > displayCount && (
            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 10)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
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
