"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

interface Props {
  bookingId: string
  artisanUserId: string
}

export default function ReviewForm({ bookingId, artisanUserId }: Props) {
  const [rating, setRating]   = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, artisanUserId, rating, comment }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Failed to submit review")
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  const displayRating = hovered || rating

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} out of 5 stars`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <Star
              size={22}
              aria-hidden="true"
              className={
                star <= displayRating
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-200 fill-slate-200"
              }
            />
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-2">{displayRating}/5</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={2}
        placeholder="Share your experience..."
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}
