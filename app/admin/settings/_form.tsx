"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X } from "lucide-react"

export default function PlatformSettingsForm({
  platformFeePercent,
  categories,
  announcementBanner,
}: {
  platformFeePercent: number
  categories: string[]
  announcementBanner: string
}) {
  const router = useRouter()
  const [percent, setPercent] = useState(String(platformFeePercent))
  const [cats, setCats] = useState(categories)
  const [newCat, setNewCat] = useState("")
  const [banner, setBanner] = useState(announcementBanner)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platformFeePercent: Number(percent),
        categories: cats,
        announcementBanner: banner,
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(data?.error ?? "Failed to save settings")
      setSaving(false)
      return
    }
    toast.success("Settings saved")
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Commission rate</h2>
        <p className="text-xs text-slate-500 mb-4">Applied to successful payments as platform revenue.</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="w-28 px-3 py-2 text-sm border border-slate-200 rounded-xl"
          />
          <span className="text-sm text-slate-500">%</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Service categories</h2>
        <p className="text-xs text-slate-500 mb-4">Shown to artisans during onboarding and browse filters.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {cats.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-slate-200 bg-slate-50">
              {cat}
              <button type="button" onClick={() => setCats(cats.filter((c) => c !== cat))} aria-label={`Remove ${cat}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Add a category"
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl"
          />
          <button
            type="button"
            onClick={() => {
              const value = newCat.trim()
              if (!value || cats.includes(value)) return
              setCats([...cats, value])
              setNewCat("")
            }}
            className="px-3 py-2 text-sm font-medium bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Announcement banner</h2>
        <p className="text-xs text-slate-500 mb-4">Site-wide message. Leave empty to hide.</p>
        <textarea
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
        />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  )
}
