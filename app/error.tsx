"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import BrandIcon from "@/components/brand-icon"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an error reporting service if needed
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <BrandIcon className="h-7 w-7" priority />
            CraftConnect
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded-md hover:bg-orange-600 transition font-bold"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
            <AlertTriangle size={36} className="stroke-[1.75]" />
          </div>
          <span className="inline-block text-xs font-bold tracking-wider text-rose-700 uppercase bg-rose-100/60 px-3 py-1 rounded-full mb-3">
            Something went wrong
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Unexpected Application Error
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            An unexpected error occurred while processing your request. Please try again or head back to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} /> Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              <Home size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-950 text-slate-400 px-4 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <BrandIcon className="h-7 w-7 ring-1 ring-emerald-900/60" />
            CraftConnect
          </Link>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} CraftConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
