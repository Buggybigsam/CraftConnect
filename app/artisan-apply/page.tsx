"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  Zap, Wrench, Sparkles, Hammer, Paintbrush, Car, BookOpen, Building2,
  ArrowLeft, CheckCircle, Loader2, ChevronDown,
} from "lucide-react"
import BrandIcon from "@/components/brand-icon"

const CATEGORIES = [
  { value: "Electrician", Icon: Zap        },
  { value: "Plumber",     Icon: Wrench     },
  { value: "Cleaner",     Icon: Sparkles   },
  { value: "Carpenter",   Icon: Hammer     },
  { value: "Painter",     Icon: Paintbrush },
  { value: "Mechanic",    Icon: Car        },
  { value: "Tutor",       Icon: BookOpen   },
  { value: "Mason",       Icon: Building2  },
  { value: "AC Technician",       Icon: Wrench     },
  { value: "Aluminum Fabricator", Icon: Hammer     },
  { value: "Appliance Repair",    Icon: Wrench     },
  { value: "Barber",              Icon: Sparkles   },
  { value: "Blacksmith",          Icon: Hammer     },
  { value: "Cobbler",             Icon: Hammer     },
  { value: "Makeup Artist",       Icon: Sparkles   },
  { value: "Plasterer",           Icon: Building2  },
  { value: "Tailor",              Icon: Paintbrush },
  { value: "Tiler",               Icon: Building2  },
  { value: "Welder",              Icon: Hammer     },
  { value: "Window Installer",    Icon: Wrench     },
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

  // On mount: if user just came back from sign-up, restore saved form and auto-submit
  useEffect(() => {
    if (!isLoaded || !user) return
    const saved = sessionStorage.getItem("artisan_apply_draft")
    if (!saved) return

    const data = JSON.parse(saved) as Record<string, string>
    sessionStorage.removeItem("artisan_apply_draft")

    // Populate visible state (deferred to avoid setState-in-effect lint error)
    setTimeout(() => {
      if (data.category) setCategory(data.category)
    }, 0)

    // Short delay so the form fields mount, then auto-submit
    setTimeout(async () => {
      setLoading(true)
      setError("")
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role:         "ARTISAN",
          bio:          data.bio,
          category:     data.category,
          pricePerHour: Number(data.pricePerHour),
          location:     data.location,
          phone:        data.phone,
          yearsExp:     Number(data.yearsExp),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        const msg = d.error ?? "Something went wrong"
        setError(msg)
        toast.error(msg)
        setLoading(false)
      } else {
        toast.success("Application submitted successfully!")
        router.push("/artisan/dashboard")
      }
    }, 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      bio:          String(fd.get("bio") ?? ""),
      category:     String(fd.get("category") ?? ""),
      pricePerHour: String(fd.get("pricePerHour") ?? ""),
      location:     String(fd.get("location") ?? ""),
      phone:        String(fd.get("phone") ?? ""),
      yearsExp:     String(fd.get("yearsExp") ?? ""),
    }

    if (!user) {
      // Save form and send to Artisan sign-up flow
      sessionStorage.setItem("artisan_apply_draft", JSON.stringify(data))
      router.push("/sign-up?role=artisan")
      return
    }

    setLoading(true)
    setError("")
    const res = await fetch("/api/users/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role:         "ARTISAN",
        bio:          data.bio,
        category:     data.category,
        pricePerHour: Number(data.pricePerHour),
        location:     data.location,
        phone:        data.phone,
        yearsExp:     Number(data.yearsExp),
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      const errorMsg = d.error ?? "Something went wrong"
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
      return
    }

    toast.success("Application submitted successfully!")
    router.push("/artisan/dashboard")
  }

  // Wait for Clerk to resolve auth state before rendering
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <BrandIcon className="h-6 w-6 ring-1 ring-slate-200" priority />
            CraftConnect
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_1.6fr] gap-10 items-start">

        {/* Left panel: benefits */}
        <div className="lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-emerald-100">
            <Zap size={11} /> For Artisans
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
            Grow your business<br />with CraftConnect
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Join hundreds of verified artisans across Ghana. Get discovered,
            manage bookings, and get paid, all in one place.
          </p>

          <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-8">
            <Image
              src="/images/artisans/roofer.jpg"
              alt="Artisan working on CraftConnect"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <ul className="space-y-3 mb-8">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>

          <div className="bg-emerald-600 rounded-2xl p-5 text-white">
            <p className="text-sm font-semibold mb-1">Free to apply</p>
            <p className="text-emerald-200 text-xs leading-relaxed">
              No upfront cost. We review your profile and activate it within 24 hours.
            </p>
          </div>
        </div>

        {/* Right panel: form */}
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
                  className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
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
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Price & Experience: 2 col */}
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
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                placeholder="e.g. Accra, Kumasi, Takoradi, Tamale"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition text-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : user ? (
                "Submit Application"
              ) : (
                "Sign Up to Apply"
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              {user
                ? "By applying you agree to our artisan terms. Your profile goes live after admin approval."
                : "You'll create a free account first, then your details here are submitted automatically."}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
