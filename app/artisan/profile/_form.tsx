"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Save, Tag, DollarSign, MapPin, Award, FileText } from "lucide-react"
import { ARTISAN_CATEGORIES } from "@/lib/artisan-categories"
import { updateArtisanProfileAction } from "./_actions"

const CATEGORIES = [
  ...ARTISAN_CATEGORIES,
  "Cleaner",
  "Tutor",
  "Gardener",
  "Other",
]

interface Props {
  profile: {
    category: string
    pricePerHour: number
    location: string
    yearsExp: number
    bio: string
  }
}

export default function ArtisanProfileForm({ profile }: Props) {
  const [category, setCategory] = useState(profile.category)
  const [pricePerHour, setPricePerHour] = useState(profile.pricePerHour.toString())
  const [location, setLocation] = useState(profile.location)
  const [yearsExp, setYearsExp] = useState(profile.yearsExp.toString())
  const [bio, setBio] = useState(profile.bio)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const price = parseFloat(pricePerHour)
    const exp = parseInt(yearsExp, 10)

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid hourly rate")
      return
    }

    if (isNaN(exp) || exp < 0) {
      toast.error("Please enter valid years of experience")
      return
    }

    startTransition(async () => {
      const res = await updateArtisanProfileAction({
        category,
        pricePerHour: price,
        location,
        yearsExp: exp,
        bio,
      })

      if (res.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(res.error ?? "Failed to update profile")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Service Category
        </label>
        <div className="relative">
          <Tag className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Base Hourly Rate (GHS)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="number"
              min="1"
              step="any"
              required
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Years of Experience
          </label>
          <div className="relative">
            <Award className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="number"
              min="0"
              required
              value={yearsExp}
              onChange={(e) => setYearsExp(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Service Location / City
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            required
            placeholder="Accra, Ghana"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Bio / Description
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <textarea
            required
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell customers about your skills, certifications, and service experience..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
        >
          <Save size={15} />
          {isPending ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  )
}
