"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ArtisanBookingActions({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(status: "CONFIRMED" | "CANCELLED") {
    setLoading(true)
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    })

    if (!res.ok) {
      toast.error("Failed to update booking status")
    } else {
      toast.success(status === "CONFIRMED" ? "Booking accepted!" : "Booking declined")
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
      <button
        type="button"
        onClick={() => updateStatus("CONFIRMED")}
        disabled={loading}
        className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
      >
        Accept
      </button>
      <button
        type="button"
        onClick={() => updateStatus("CANCELLED")}
        disabled={loading}
        className="flex-1 bg-red-50 text-red-600 border border-red-200 text-xs py-2 rounded-xl font-medium hover:bg-red-100 disabled:opacity-50 transition"
      >
        Decline
      </button>
    </div>
  )
}
