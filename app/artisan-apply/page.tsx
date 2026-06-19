"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import {
  Zap, Wrench, Sparkles, Hammer, Paintbrush, Car, BookOpen, Building2,
  ArrowLeft, CheckCircle, Loader2, ChevronDown,
} from "lucide-react"

const CATEGORIES = [
  { value: "Electrician", Icon: Zap        },
  { value: "Plumber",     Icon: Wrench     },
  { value: "Cleaner",     Icon: Sparkles   },
  { value: "Carpenter",   Icon: Hammer     },
  { value: "Painter",     Icon: Paintbrush },
  { value: "Mechanic",    Icon: Car        },
  { value: "Tutor",       Icon: BookOpen   },
  { value: "Mason",       Icon: Building2  },
  { value: "Other",       Icon: Zap        },
]

const PERKS = [
  "Get discovered by customers near you",
  "Set your own hours and pricing",
  "Receive bookings and payments online",
  "Build your reputation with verified reviews",
]

export default function ArtisanApplyPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [category, setCategory] = useState("")

  // Redirect unauthenticated users to sign-up immediately
  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/sign-up")
    }
  }, [isLoaded, user, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) { router.push("/sign-up"); return }

    setLoading(true)
    setError("")
    const fd = new FormData(e.currentTarget)

    const res = await fetch("/api/users/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role:         "ARTISAN",
        bio:          fd.get("bio"),
        category:     fd.get("category"),
        pricePerHour: Number(fd.get("pricePerHour")),
        location:     fd.get("location"),
        phone:        fd.get("phone"),
        yearsExp:     Number(fd.get("yearsExp")),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/artisan/dashboard")
  }

  // Show spinner while loading or redirecting
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </span>
            SmartBooking
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_1.6fr] gap-10 items-start">

        {/* Left panel — benefits */}
        <div className="lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-indigo-100">
            <Zap size={11} /> For Artisans
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
            Grow your business<br />with SmartBooking
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Join hundreds of verified artisans across Ghana and Nigeria. Get discovered,
            manage bookings, and get paid — all in one place.
          </p>

          <ul className="space-y-3 mb-8">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>

          <div className="bg-indigo-600 rounded-2xl p-5 text-white">
            <p className="text-sm font-semibold mb-1">Free to apply</p>
            <p className="text-indigo-200 text-xs leading-relaxed">
              No upfront cost. We review your profile and activate it within 24 hours.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">Your Application</h2>
            <p className="text-slate-500 text-xs mt-0.5">All fields are required. Our team reviews applications within 24 hrs.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Trade / Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Trade</label>
              <div className="relative">
                <select
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                >
                  <option value="">Select your trade...</option>
                  {CATEGORIES.map(({ value }) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">About You</label>
              <textarea
                name="bio"
                required
                rows={4}
                placeholder="Describe your skills, experience, and what makes you stand out..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Price & Experience — 2 col */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rate <span className="text-slate-400 font-normal">(GHS/hr)</span>
                </label>
                <input
                  type="number"
                  name="pricePerHour"
                  required
                  min={1}
                  placeholder="e.g. 80"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Experience <span className="text-slate-400 font-normal">(years)</span>
                </label>
                <input
                  type="number"
                  name="yearsExp"
                  required
                  min={0}
                  placeholder="e.g. 5"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City / Location</label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Accra, Kumasi, Lagos, Abuja"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+233 XX XXX XXXX"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition text-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                "Submit Application"
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              By applying you agree to our artisan terms. Your profile goes live after admin approval.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
