"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Search, MapPin, SlidersHorizontal } from "lucide-react"

interface Props {
  params: { q?: string; location?: string; maxPrice?: string; minRating?: string; category?: string }
}

export default function BrowseFilters({ params }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(params.q ?? "")
  const [location, setLocation] = useState(params.location ?? "")
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? "")
  const [minRating, setMinRating] = useState(params.minRating ?? "0")

  function applyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const sp = new URLSearchParams()
    if (q) sp.set("q", q)
    if (location) sp.set("location", location)
    if (maxPrice) sp.set("maxPrice", maxPrice)
    if (minRating && minRating !== "0") sp.set("minRating", minRating)
    if (params.category) sp.set("category", params.category)
    router.push(`/customer/browse?${sp.toString()}`)
  }

  return (
    <form onSubmit={applyFilters} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto_auto]">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by skill or name"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="relative block">
          <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <div className="relative">
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 lg:w-36"
          >
            <option value="0">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative">
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 lg:w-40"
          >
            <option value="">Any price</option>
            <option value="50">Under GHS 50</option>
            <option value="100">Under GHS 100</option>
            <option value="200">Under GHS 200</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <SlidersHorizontal size={15} />
          Apply
        </button>
      </div>
    </form>
  )
}
