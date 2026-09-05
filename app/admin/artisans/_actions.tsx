"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export default function AdminArtisanDecisionActions({
  artisanProfileId,
  status,
}: {
  artisanProfileId: string
  status: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [nextStatus, setNextStatus] = useState<"APPROVED" | "REJECTED" | "PENDING" | null>(null)

  async function run(status: "APPROVED" | "REJECTED" | "PENDING") {
    setPending(true)
    const res = await fetch("/api/admin/artisans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanProfileId, status }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(data?.error ?? "Failed to update artisan")
      setPending(false)
      return
    }
    toast.success(`Application set to ${status}`)
    setNextStatus(null)
    setPending(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
      {status !== "APPROVED" && (
        <button
          type="button"
          onClick={() => setNextStatus("APPROVED")}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Approve
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          type="button"
          onClick={() => setNextStatus("REJECTED")}
          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
        >
          Reject
        </button>
      )}
      {status !== "PENDING" && (
        <button
          type="button"
          onClick={() => setNextStatus("PENDING")}
          className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100"
        >
          Reopen
        </button>
      )}

      {nextStatus && (
        <ConfirmModal
          title={
            nextStatus === "APPROVED"
              ? "Approve this artisan?"
              : nextStatus === "REJECTED"
                ? "Reject this application?"
                : "Reopen this application?"
          }
          description="This writes an audit log entry and may email the artisan."
          confirmLabel="Confirm"
          confirmClassName={
            nextStatus === "REJECTED"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }
          pending={pending}
          onCancel={() => setNextStatus(null)}
          onConfirm={() => run(nextStatus)}
        />
      )}
    </div>
  )
}
