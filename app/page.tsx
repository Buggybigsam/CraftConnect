import Link from "next/link"
import {
  Zap, Wrench, Sparkles, Hammer, Paintbrush, Car, BookOpen, Building2,
  Search, CalendarCheck, CreditCard, Star, MapPin, ArrowRight,
  Shield, Clock, BadgeCheck, User,
} from "lucide-react"
import { prisma } from "@/lib/prisma"

const CATEGORIES = [
  { name: "Electrician",  Icon: Zap,        desc: "Wiring, repairs & installations", bg: "bg-amber-50",  fg: "text-amber-600"  },
  { name: "Plumber",      Icon: Wrench,      desc: "Pipes, leaks & fixtures",         bg: "bg-sky-50",    fg: "text-sky-600"    },
  { name: "Cleaner",      Icon: Sparkles,    desc: "Home & office cleaning",          bg: "bg-teal-50",   fg: "text-teal-600"   },
  { name: "Carpenter",    Icon: Hammer,      desc: "Furniture & woodwork",            bg: "bg-orange-50", fg: "text-orange-600" },
  { name: "Painter",      Icon: Paintbrush,  desc: "Interior & exterior painting",    bg: "bg-rose-50",   fg: "text-rose-600"   },
  { name: "Mechanic",     Icon: Car,         desc: "Vehicle repairs & servicing",     bg: "bg-slate-50",  fg: "text-slate-600"  },
  { name: "Tutor",        Icon: BookOpen,    desc: "Academic & skills coaching",      bg: "bg-violet-50", fg: "text-violet-600" },
  { name: "Mason",        Icon: Building2,   desc: "Bricklaying & construction",      bg: "bg-stone-50",  fg: "text-stone-600"  },
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
    take:    4,
  })
}

export default async function LandingPage() {
  const featured = await getFeaturedArtisans().catch(() => [])

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </span>
            SmartBooking
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/artisan-apply" className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 transition">
              For Artisans
            </Link>
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Trusted in Ghana &amp; Nigeria
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            Find trusted artisans.
            <br />
            <span className="text-indigo-400">Book in seconds.</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Connect with verified local professionals for electrical, plumbing, cleaning, and more.
            No middlemen. No hassle. Just results.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-500 transition"
            >
              Find an Artisan <ArrowRight size={16} />
            </Link>
            <Link
              href="/artisan-apply"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition"
            >
              Join as Artisan
            </Link>
          </div>
        </div>

        {/* stat strip */}
        <div className="relative border-t border-white/10 bg-white/5">
          <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center text-sm">
            {[["500+", "Artisans"], ["12+", "Cities"], ["4.8★", "Avg Rating"]].map(([num, label]) => (
              <div key={label}>
                <div className="text-white font-bold text-xl">{num}</div>
                <div className="text-slate-400 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ───────────────────────────────────── */}
      <section className="py-14 px-4 border-b">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
          {TRUST.map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{label}</div>
                <div className="text-slate-500 text-sm mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Browse by Service</h2>
            <p className="text-slate-500 text-sm mt-2">Pick a category to find the right pro for your job.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ name, Icon, desc, bg, fg }) => (
              <Link
                key={name}
                href="/sign-up"
                className="group bg-white rounded-2xl p-5 text-left border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={20} className={fg} />
                </div>
                <div className="font-semibold text-slate-900 text-sm">{name}</div>
                <div className="text-slate-500 text-xs mt-1 leading-relaxed">{desc}</div>
              </Link>
            ))}
          </div>
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
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 tracking-widest">{step}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Artisans ───────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Top-Rated Artisans</h2>
                <p className="text-slate-500 text-sm mt-1">Highest-rated professionals on the platform.</p>
              </div>
              <Link href="/sign-up" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    {a.user.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.user.imageUrl} className="w-12 h-12 rounded-full object-cover" alt={a.user.name} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                        <User size={22} className="text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{a.user.name}</div>
                      <div className="text-xs text-indigo-600 font-medium">{a.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm mb-2">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">{a.rating.toFixed(1)}</span>
                    <span className="text-slate-400 text-xs">({a.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                    <MapPin size={11} />
                    {a.location}
                  </div>
                  <div className="text-sm font-bold text-slate-900">GHS {a.pricePerHour}<span className="font-normal text-slate-400">/hr</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get the job done?</h2>
          <p className="text-indigo-200 mb-7 text-sm leading-relaxed">
            Create a free account and find a trusted artisan near you in minutes.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition"
          >
            Create a Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <Zap size={10} className="text-white" />
            </span>
            SmartBooking
          </div>
          <p>© {new Date().getFullYear()} SmartBooking · Ghana &amp; Nigeria</p>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-slate-900 transition">Sign in</Link>
            <Link href="/artisan-apply" className="hover:text-slate-900 transition">For Artisans</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
