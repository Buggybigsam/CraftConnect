"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  artisanProfileId: string
  artisanEmail: string
  artisanName: string
}

export default function AdminArtisanActions({ artisanProfileId, artisanEmail, artisanName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateArtisan(status: "APPROVED" | "REJECTED") {
    setLoading(true)
    await fetch("/api/admin/artisans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanProfileId, status, artisanEmail, artisanName }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t">
      <button
        onClick={() => updateArtisan("APPROVED")}
        disabled={loading}
        className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => updateArtisan("REJECTED")}
        disabled={loading}
        className="flex-1 bg-red-50 text-red-600 border border-red-200 text-sm py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
