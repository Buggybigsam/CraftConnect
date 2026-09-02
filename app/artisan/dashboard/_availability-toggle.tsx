"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { toggleAvailabilityAction } from "./_actions"

interface Props {
  initialAvailable: boolean
}

export default function AvailabilityToggle({ initialAvailable }: Props) {
  const [isAvailable, setIsAvailable] = useState(initialAvailable)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const nextState = !isAvailable
    setIsAvailable(nextState)

    startTransition(async () => {
      const res = await toggleAvailabilityAction(nextState)
      if (res.success) {
        toast.success(nextState ? "You are now active for new bookings" : "You are now marked as unavailable")
      } else {
        setIsAvailable(!nextState)
        toast.error(res.error ?? "Failed to update availability")
      }
    })
  }

  return (
    <div className="inline-flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Booking Status
        </span>
        <span className="text-xs font-semibold text-slate-800">
          {isAvailable ? "Available" : "Paused"}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isAvailable}
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 ${
          isAvailable ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isAvailable ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
