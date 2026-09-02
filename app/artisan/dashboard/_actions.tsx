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
    <div className="flex gap-2 mt-3 pt-3 border-t">
      <button
        onClick={() => updateStatus("CONFIRMED")}
        disabled={loading}
        className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={() => updateStatus("CANCELLED")}
        disabled={loading}
        className="flex-1 bg-red-50 text-red-600 border border-red-200 text-sm py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
