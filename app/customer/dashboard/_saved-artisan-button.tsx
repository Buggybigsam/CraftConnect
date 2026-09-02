"use client"

import { useTransition } from "react"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"
import { toggleSavedArtisanAction } from "./_actions"

interface Props {
  artisanId: string
  isSaved: boolean
}

export default function SavedArtisanButton({ artisanId, isSaved }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const res = await toggleSavedArtisanAction(artisanId)
      if (res.success) {
        toast.success(res.saved ? "Added to Saved Artisans" : "Removed from Saved Artisans")
      } else {
        toast.error(res.error ?? "Failed to update saved artisans")
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isSaved ? "Remove from saved" : "Save artisan"}
      className={`p-1.5 rounded-lg transition ${
        isSaved
          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Bookmark size={15} className={isSaved ? "fill-emerald-600" : ""} />
    </button>
  )
}
