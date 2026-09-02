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
  PENDING:   "bg-amber-50  text-amber-700  border-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50    text-red-700    border-red-100",
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
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "PENDING" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CONFIRMED")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "CONFIRMED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "COMPLETED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CANCELLED")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
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
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
          <Layers size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 font-medium text-sm">No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} bookings found</p>
          <p className="text-slate-400 text-xs mt-1">Bookings matching this filter will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isNewPending = b.status === "PENDING" && b.isNew

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition ${
                  isNewPending ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{b.customer.name}</span>
                      {isNewPending && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                          <Sparkles size={10} /> NEW
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-medium text-slate-700">{b.service.title}</div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
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
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        Booked {new Date(b.createdAt).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    {/* Customer Contact Details (Email + Phone) */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        {b.customer.email}
                      </span>
                      {b.customer.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          {b.customer.phone}
                        </span>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg px-2.5 py-1.5 mt-2 border border-slate-100">
                        &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-900 mt-2 justify-end">
                      <DollarSign size={13} className="text-slate-400" />
                      GHS {b.service.price}
                    </div>
                    {b.payment && (
                      <span className={`block text-[11px] font-medium mt-1 ${b.payment.status === "SUCCESS" ? "text-emerald-600" : "text-slate-400"}`}>
                        {b.payment.status === "SUCCESS" ? "Paid" : b.payment.status}
                      </span>
                    )}
                  </div>
                </div>

                {b.status === "PENDING" && (
                  <ArtisanBookingActions bookingId={b.id} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
