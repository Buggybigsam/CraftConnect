import Link from "next/link"
import {
  Zap, Wrench, Sparkles, Hammer, Paintbrush, Car, BookOpen, Building2,
  Search, CalendarCheck, CreditCard, Star, MapPin, ArrowRight, PlusCircle, Flame,
  Shield, Clock, BadgeCheck, User, ChevronDown,
} from "lucide-react"
import { prisma } from "@/lib/prisma"

const CATEGORIES = [
  { name: "Electrician",  Icon: Zap,        bg: "bg-amber-50",  fg: "text-amber-600"  },
  { name: "Plumber",      Icon: Wrench,     bg: "bg-sky-50",    fg: "text-sky-600"    },
  { name: "Cleaner",      Icon: Sparkles,   bg: "bg-teal-50",   fg: "text-teal-600"   },
  { name: "Carpenter",    Icon: Hammer,     bg: "bg-orange-50", fg: "text-orange-600" },
  { name: "Painter",      Icon: Paintbrush, bg: "bg-rose-50",   fg: "text-rose-600"   },
  { name: "Mechanic",     Icon: Car,        bg: "bg-slate-50",  fg: "text-slate-600"  },
  { name: "Tutor",        Icon: BookOpen,   bg: "bg-violet-50", fg: "text-violet-600" },
  { name: "Mason",        Icon: Building2,  bg: "bg-stone-50",  fg: "text-stone-600"  },
]

const STEPS = [
  { Icon: Search,       step: "01", title: "Search",        desc: "Browse verified artisans by category, location, or price in your area." },
  { Icon: CalendarCheck,step: "02", title: "Book",          desc: "Pick your preferred date and time and confirm your booking instantly."   },
  { Icon: CreditCard,   step: "03", title: "Pay & Review",  desc: "Pay securely via Paystack and leave a rating once the job is done."      },
]

const TRUST = [
  { Icon: BadgeCheck, label: "Verified Artisans",   desc: "Every artisan is manually approved by our team." },
  { Icon: Shield,     label: "Secure Payments",     desc: "End-to-end encrypted via Paystack."              },
  { Icon: Clock,      label: "Book in Minutes",     desc: "No calls. No waiting. Instant confirmation."     },
]

async function getFeaturedArtisans() {
  return prisma.artisanProfile.findMany({
    where:   { status: "APPROVED" },
    include: { user: true },
    orderBy: { rating: "desc" },
    take:    8,
  })
}

export default async function LandingPage() {
  const featured = await getFeaturedArtisans().catch(() => [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="bg-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-emerald-600" />
            </span>
            SmartBooking
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/artisan-apply" className="hidden sm:block text-sm text-white/90 hover:text-white transition">
              For Artisans
            </Link>
            <Link href="/sign-in" className="text-sm text-white/90 hover:text-white transition">
              Sign in
            </Link>
            <span className="hidden sm:block text-white/30">|</span>
            <Link
              href="/sign-up"
              className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded-md hover:bg-orange-600 transition font-bold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero / search band ──────────────────────────────── */}
      <section className="bg-gradient-to-b from-emerald-600 to-emerald-500 pb-10 pt-10 sm:pt-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-white text-2xl sm:text-3xl font-bold mb-6">
            What service are you looking for?
          </h1>
          <form action="/customer/browse" className="bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
            <div className="relative sm:w-52 shrink-0">
              <select
                name="category"
                defaultValue=""
                className="w-full h-full appearance-none border-0 sm:border-r border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="I am looking for..."
              className="flex-1 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition"
            >
              <Search size={16} /> Search
            </button>
          </form>
          <p className="text-emerald-100 text-xs mt-4">
            Trusted by 500+ verified artisans across 12+ cities in Ghana
          </p>
        </div>
      </section>

      {/* ── Quick-action / category icon grid ───────────────── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            <Link href="/artisan-apply" className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <PlusCircle size={20} className="text-orange-500" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center leading-tight">Join as<br />Artisan</span>
            </Link>
            <Link href="/customer/browse" className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
                <Flame size={20} className="text-rose-500" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center leading-tight">Trending</span>
            </Link>
            {CATEGORIES.map(({ name, Icon, bg, fg }) => (
              <Link
                key={name}
                href={`/customer/browse?category=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={20} className={fg} />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sidebar + Trending listings ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-8 w-full grid lg:grid-cols-[220px_1fr] gap-6">

        {/* Category sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden sticky top-20">
            {CATEGORIES.map(({ name, Icon, fg }) => (
              <Link
                key={name}
                href={`/customer/browse?category=${encodeURIComponent(name)}`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-slate-50 last:border-0 transition"
              >
                <Icon size={15} className={fg} />
                {name}
              </Link>
            ))}
            <Link
              href="/customer/browse"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
            >
              View all artisans <ArrowRight size={13} />
            </Link>
          </div>
        </aside>

        {/* Trending grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame size={18} className="text-rose-500" /> Trending Artisans
            </h2>
            <Link href="/customer/browse" className="text-sm text-emerald-700 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
              No artisans available yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {featured.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {a.user.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.user.imageUrl} className="w-11 h-11 rounded-full object-cover" alt={a.user.name} />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
                          <User size={20} className="text-emerald-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">{a.user.name}</div>
                        <div className="text-xs text-emerald-700 font-medium">{a.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm mb-1.5">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-900">{a.rating.toFixed(1)}</span>
                      <span className="text-slate-400 text-xs">({a.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                      <MapPin size={11} />
                      {a.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                        <BadgeCheck size={11} /> Verified
                      </span>
                      <span className="text-sm font-bold text-slate-900">GHS {a.pricePerHour}<span className="font-normal text-slate-400 text-xs">/hr</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Trust signals ───────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-y">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
          {TRUST.map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{label}</div>
                <div className="text-slate-500 text-sm mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-2">Three steps to getting the job done.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ Icon, step, title, desc }) => (
              <div key={step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tracking-widest">{step}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get the job done?</h2>
          <p className="text-emerald-100 mb-7 text-sm leading-relaxed">
            Create a free account and find a trusted artisan near you in minutes.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-orange-600 transition"
          >
            Create a Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t bg-slate-950 text-slate-400 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <span className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={13} className="text-white" />
            </span>
            SmartBooking
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/customer/browse" className="hover:text-white transition">Browse Artisans</Link>
            <Link href="/artisan-apply" className="hover:text-white transition">Join as Artisan</Link>
            <Link href="/about" className="hover:text-white transition">About Us</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <a href="mailto:support@smartbooking.com" className="hover:text-white transition">Contact Support</a>
          </div>

          <p className="text-xs text-slate-600">© {new Date().getFullYear()} SmartBooking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
