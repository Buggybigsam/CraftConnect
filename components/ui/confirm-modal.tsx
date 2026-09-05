"use client"

import type { ReactNode } from "react"
import { AlertCircle } from "lucide-react"

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmClassName = "bg-red-600 hover:bg-red-700 text-white",
  pending,
  onCancel,
  onConfirm,
  children,
}: {
  title: string
  description: string
  confirmLabel: string
  confirmClassName?: string
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
  children?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-4">{description}</p>
        {children}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`flex-1 px-4 py-2 text-xs font-medium rounded-xl transition disabled:opacity-50 ${confirmClassName}`}
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
