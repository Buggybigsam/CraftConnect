"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { toggleAvailabilityAction } from "./_actions"
import { Zap, PauseCircle } from "lucide-react"

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
        toast.success(
          nextState
            ? "You are now active and receiving customer bookings!"
            : "Your profile is paused for new bookings"
        )
      } else {
        setIsAvailable(!nextState)
        toast.error(res.error ?? "Failed to update availability")
      }
    })
  }

  return (
    <div className="inline-flex items-center gap-3 bg-white/95 border border-slate-200/90 pl-3.5 pr-2 py-1.5 rounded-2xl shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {isAvailable && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isAvailable ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
        </span>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Booking Status
            </span>
            {isAvailable ? (
              <Zap size={11} className="text-emerald-600 fill-emerald-600" />
            ) : (
              <PauseCircle size={11} className="text-slate-400" />
            )}
          </div>
          <span
            className={`text-xs font-bold leading-tight ${
              isAvailable ? "text-emerald-700" : "text-slate-600"
            }`}
          >
            {isAvailable ? "Online & Available" : "Paused"}
          </span>
        </div>
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
        title={isAvailable ? "Click to pause bookings" : "Click to go live"}
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
