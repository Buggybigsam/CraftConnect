"use client"

import { useState } from "react"
import { Phone, Mail, DollarSign, Calendar, Layers, Clock, Sparkles } from "lucide-react"
import ArtisanBookingActions from "./_booking-actions"
import ExportBookingsButton from "./_export-bookings"

interface BookingItem {
  id: string
  date: string
  notes: string | null
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  createdAt: string
  isNew?: boolean
  customer: {
    name: string
    email: string
    phone: string | null
  }
  service: {
    id: string
    title: string
    price: number
    category: string
  }
  payment: {
    id: string
    amount: number
    currency: string
    status: string
    reference: string
    paidAt: string | null
  } | null
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50  text-amber-800  border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-blue-50 text-blue-800 border-blue-200",
  CANCELLED: "bg-rose-50    text-rose-800    border-rose-200",
}

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

interface Props {
  bookings: BookingItem[]
}

export default function ArtisanBookingList({ bookings }: Props) {
  const [activeTab, setActiveTab] = useState<FilterStatus>("ALL")

  const filtered = bookings.filter((b) => {
    if (activeTab === "ALL") return true
    return b.status === activeTab
  })

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === "PENDING" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CONFIRMED")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === "CONFIRMED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === "COMPLETED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CANCELLED")}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === "CANCELLED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* CSV Export Button */}
        <ExportBookingsButton bookings={bookings} />
      </div>

      {/* Bookings Feed */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <Layers size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-700 font-extrabold text-sm">No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} bookings found</p>
          <p className="text-slate-400 text-xs mt-1">Bookings matching this filter will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isNewPending = b.status === "PENDING" && b.isNew

            return (
              <div
                key={b.id}
                className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-all ${
                  isNewPending
                    ? "border-amber-300 bg-amber-50/20 ring-1 ring-amber-200"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {b.customer.name.charAt(0)}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm">{b.customer.name}</span>
                      {isNewPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                          <Sparkles size={10} /> NEW REQUEST
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-800">{b.service.title}</div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                        <Calendar size={13} className="text-emerald-600" />
                        {new Date(b.date).toLocaleDateString("en-GH", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        Booked {new Date(b.createdAt).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    {/* Customer Contact Details (Email + Phone) */}
                    <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
                      <a
                        href={`mailto:${b.customer.email}`}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-medium transition"
                      >
                        <Mail size={12} className="text-slate-400" />
                        {b.customer.email}
                      </a>
                      {b.customer.phone && (
                        <a
                          href={`tel:${b.customer.phone}`}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold transition"
                        >
                          <Phone size={12} />
                          {b.customer.phone}
                        </a>
                      )}
                    </div>

                    {b.notes && (
                      <div className="text-xs text-slate-600 italic bg-slate-50 rounded-xl px-3 py-2 mt-2 border border-slate-200/70">
                        &ldquo;{b.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                    <div className="flex items-center gap-1 text-base font-black text-slate-900 mt-2.5 justify-end">
                      GHS {b.service.price}
                    </div>
                    {b.payment && (
                      <span className={`inline-block text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                        b.payment.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {b.payment.status === "SUCCESS" ? "Paid via Paystack" : b.payment.status}
                      </span>
                    )}
                  </div>
                </div>

                {b.status === "PENDING" && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <ArtisanBookingActions bookingId={b.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
