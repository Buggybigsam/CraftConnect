"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Calendar, X, AlertCircle } from "lucide-react"
import { cancelBookingAction, rescheduleBookingAction } from "./_actions"

interface Props {
  bookingId: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  currentDate: string
}

export default function CustomerBookingActions({ bookingId, status, currentDate }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [newDate, setNewDate] = useState("")

  if (status !== "PENDING" && status !== "CONFIRMED") {
    return null
  }

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelBookingAction(bookingId)
      if (res.success) {
        toast.success("Booking cancelled successfully")
        setShowCancelModal(false)
      } else {
        toast.error(res.error ?? "Failed to cancel booking")
      }
    })
  }

  function handleReschedule(e: React.FormEvent) {
    e.preventDefault()
    if (!newDate) {
      toast.error("Please pick a new date and time")
      return
    }

    startTransition(async () => {
      const res = await rescheduleBookingAction(bookingId, newDate)
      if (res.success) {
        toast.success("Booking rescheduled successfully!")
        setShowRescheduleModal(false)
      } else {
        toast.error(res.error ?? "Failed to reschedule booking")
      }
    })
  }

  // Format minimum date as today
  const minDateTime = new Date().toISOString().slice(0, 16)

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
      {status === "CONFIRMED" && (
        <button
          type="button"
          onClick={() => {
            const formatted = new Date(currentDate).toISOString().slice(0, 16)
            setNewDate(formatted)
            setShowRescheduleModal(true)
          }}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
        >
          <Calendar size={13} />
          Reschedule
        </button>
      )}

      <button
        type="button"
        onClick={() => setShowCancelModal(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 disabled:opacity-50"
      >
        <X size={13} />
        Cancel Booking
      </button>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Cancel this booking?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to cancel? This slot will be released back to the artisan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {isPending ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reschedule Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select new date and time
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDateTime}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isPending ? "Rescheduling..." : "Confirm Date"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
