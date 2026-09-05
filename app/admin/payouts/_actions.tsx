"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export default function MarkPayoutPaid({ artisanId, owed }: { artisanId: string; owed: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [amount, setAmount] = useState(owed.toFixed(2))

  async function run() {
    setPending(true)
    const res = await fetch("/api/admin/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanId, amount: Number(amount) }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(data?.error ?? "Payout failed")
      setPending(false)
      return
    }
    toast.success("Payout recorded")
    setOpen(false)
    setPending(false)
    router.refresh()
  }

  if (owed <= 0) return <span className="text-xs text-slate-400">Settled</span>

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-50"
      >
        Mark paid
      </button>
      {open && (
        <ConfirmModal
          title="Record a payout?"
          description="This marks funds as paid out to the artisan. It does not transfer money by itself."
          confirmLabel="Mark paid"
          confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
          pending={pending}
          onCancel={() => setOpen(false)}
          onConfirm={run}
        >
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mb-4 text-sm border border-slate-200 rounded-xl px-3 py-2"
          />
        </ConfirmModal>
      )}
    </>
  )
}
