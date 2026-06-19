"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  categories: string[]
  params: { q?: string; location?: string; maxPrice?: string; minRating?: string; category?: string }
}

export default function BrowseFilters({ params }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(params.q ?? "")
  const [location, setLocation] = useState(params.location ?? "")
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? "")
  const [minRating, setMinRating] = useState(params.minRating ?? "0")

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (q) sp.set("q", q)
    if (location) sp.set("location", location)
    if (maxPrice) sp.set("maxPrice", maxPrice)
    if (minRating && minRating !== "0") sp.set("minRating", minRating)
    if (params.category) sp.set("category", params.category)
    router.push(`/customer/browse?${sp.toString()}`)
  }

  return (
    <form onSubmit={applyFilters} className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[160px]">
        <label className="text-xs text-gray-500 block mb-1">Search</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, skill, keyword..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-gray-500 block mb-1">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Accra"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="min-w-[120px]">
        <label className="text-xs text-gray-500 block mb-1">Max price (GHS/hr)</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Any"
          min={0}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="min-w-[110px]">
        <label className="text-xs text-gray-500 block mb-1">Min rating</label>
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="0">Any</option>
          <option value="3">3+ ★</option>
          <option value="4">4+ ★</option>
          <option value="4.5">4.5+ ★</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  )
}
