"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { CheckCircle2, XCircle } from "lucide-react"

interface Props {
  artisanProfileId: string
  artisanEmail: string
  artisanName: string
}

export default function AdminArtisanActions({ artisanProfileId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmStatus, setConfirmStatus] = useState<"APPROVED" | "REJECTED" | null>(null)
  const router = useRouter()

  async function updateArtisan(status: "APPROVED" | "REJECTED") {
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/artisans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanProfileId, status }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      const errorMsg = data?.error ?? "Failed to update artisan"
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
      return
    }

    toast.success(`Artisan ${status === "APPROVED" ? "approved" : "rejected"} successfully`)
    setConfirmStatus(null)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex gap-2">
        <button
          onClick={() => setConfirmStatus("APPROVED")}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
        >
          <CheckCircle2 size={14} />
          Approve
        </button>
        <button
          onClick={() => setConfirmStatus("REJECTED")}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold py-2.5 rounded-xl hover:bg-rose-100 disabled:opacity-50 transition"
        >
          <XCircle size={14} />
          Reject
        </button>
      </div>
      {error && <p className="text-rose-500 text-xs mt-2 font-medium">{error}</p>}
      {confirmStatus && (
        <ConfirmModal
          title={confirmStatus === "APPROVED" ? "Approve this artisan?" : "Reject this application?"}
          description="This is recorded in the audit log and emails the applicant."
          confirmLabel={confirmStatus === "APPROVED" ? "Approve" : "Reject"}
          confirmClassName={
            confirmStatus === "APPROVED"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }
          pending={loading}
          onCancel={() => setConfirmStatus(null)}
          onConfirm={() => updateArtisan(confirmStatus)}
        />
      )}
    </div>
  )
}
