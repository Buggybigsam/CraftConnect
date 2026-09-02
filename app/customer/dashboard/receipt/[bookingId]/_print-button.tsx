"use client"

import { Printer } from "lucide-react"

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition print:hidden"
    >
      <Printer size={15} />
      Print Receipt
    </button>
  )
}
