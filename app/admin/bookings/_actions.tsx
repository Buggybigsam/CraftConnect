"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface Booking {
  id: string
  status: string
  paymentStatus?: string | null
  artisans: { id: string; name: string }[]
  currentArtisanId: string
}

export default function AdminBookingActions({ booking }: { booking: Booking }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [modal, setModal] = useState<"cancel" | "refund" | "reassign" | null>(null)
  const [artisanId, setArtisanId] = useState(booking.artisans.find((a) => a.id !== booking.currentArtisanId)?.id ?? "")

  async function run(action: "cancel" | "refund" | "reassign") {
    setPending(true)
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, action, artisanId: action === "reassign" ? artisanId : undefined }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(data?.error ?? "Action failed")
      setPending(false)
      return
    }
    toast.success(
      action === "cancel" ? "Booking cancelled" : action === "refund" ? "Refund issued" : "Booking reassigned"
    )
    setModal(null)
    setPending(false)
    router.refresh()
  }

  const canAct = booking.status === "PENDING" || booking.status === "CONFIRMED"
  const canRefund = booking.paymentStatus === "SUCCESS"

  if (!canAct && !canRefund) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {canAct && (
        <button
          type="button"
          onClick={() => setModal("cancel")}
          className="px-2 py-1 text-xs font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50"
        >
          Cancel
        </button>
      )}
      {canRefund && (
        <button
          type="button"
          onClick={() => setModal("refund")}
          className="px-2 py-1 text-xs font-medium text-amber-700 border border-amber-100 rounded-lg hover:bg-amber-50"
        >
          Refund
        </button>
      )}
      {canAct && (
        <button
          type="button"
          onClick={() => setModal("reassign")}
          className="px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          Reassign
        </button>
      )}

      {modal === "cancel" && (
        <ConfirmModal
          title="Cancel this booking?"
          description="The customer and artisan will lose this slot. This cannot be undone."
          confirmLabel="Yes, cancel"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run("cancel")}
        />
      )}
      {modal === "refund" && (
        <ConfirmModal
          title="Refund this payment?"
          description="This sends a Paystack refund and cancels the booking."
          confirmLabel="Issue refund"
          confirmClassName="bg-amber-600 hover:bg-amber-700 text-white"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run("refund")}
        />
      )}
      {modal === "reassign" && (
        <ConfirmModal
          title="Reassign this booking?"
          description="Choose an approved artisan to take over this booking."
          confirmLabel="Reassign"
          confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run("reassign")}
        >
          <select
            value={artisanId}
            onChange={(e) => setArtisanId(e.target.value)}
            className="w-full mb-4 text-sm border border-slate-200 rounded-xl px-3 py-2 text-left"
          >
            <option value="">Select artisan</option>
            {booking.artisans
              .filter((a) => a.id !== booking.currentArtisanId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </ConfirmModal>
      )}
    </div>
  )
}
