"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export default function AdminReviewActions({
  reviewId,
  flagged,
}: {
  reviewId: string
  flagged: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [modal, setModal] = useState<"flag" | "unflag" | "remove" | null>(null)

  async function run(action: "flag" | "unflag" | "remove") {
    setPending(true)
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, action }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(data?.error ?? "Action failed")
      setPending(false)
      return
    }
    toast.success(action === "remove" ? "Review removed" : action === "flag" ? "Review flagged" : "Flag cleared")
    setModal(null)
    setPending(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flagged ? (
        <button
          type="button"
          onClick={() => setModal("unflag")}
          className="px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          Clear flag
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setModal("flag")}
          className="px-2 py-1 text-xs font-medium text-amber-700 border border-amber-100 rounded-lg hover:bg-amber-50"
        >
          Flag
        </button>
      )}
      <button
        type="button"
        onClick={() => setModal("remove")}
        className="px-2 py-1 text-xs font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50"
      >
        Remove
      </button>

      {modal && (
        <ConfirmModal
          title={modal === "remove" ? "Remove this review?" : modal === "flag" ? "Flag this review?" : "Clear this flag?"}
          description={
            modal === "remove"
              ? "The review will be hidden and the artisan rating recalculated."
              : "This will be recorded in the audit log."
          }
          confirmLabel="Confirm"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run(modal)}
        />
      )}
    </div>
  )
}
