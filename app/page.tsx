import Link from "next/link"
import Image from "next/image"
import {
  Search, Star, MapPin, ShieldCheck, Check,
  ChevronRight, LayoutDashboard,
} from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { UserButton } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { ARTISAN_CATEGORY_PHOTOS, getArtisanPhoto } from "@/lib/artisan-categories"
import SiteBanner from "@/components/site-banner"
import BrandIcon from "@/components/brand-icon"

const CATEGORIES = [
  { name: "Plumber", desc: "Leaks, pipes, installations" },
  { name: "Electrician", desc: "Wiring, repairs, fittings" },
  { name: "Carpenter", desc: "Woodwork, doors, cabinets" },
  { name: "Painter", desc: "Interior and exterior painting" },
  { name: "AC Technician", desc: "Install, repair, maintain" },
  { name: "Appliance Repair", desc: "Fridges, washers, ovens" },
  { name: "Tailor", desc: "Fitting, alterations, custom work" },
  { name: "Mechanic", desc: "Vehicle diagnostics and repair" },
] as const

const STEPS = [
  { step: "01", title: "Choose a service", desc: "Search by trade or tell us what you need." },
  { step: "02", title: "Pick an artisan", desc: "Compare verified profiles, ratings, and rates." },
  { step: "03", title: "Book and pay", desc: "Choose a slot and pay securely with Paystack." },
  { step: "04", title: "Get the job done", desc: "The artisan shows up. You review when it’s complete." },
]

async function getFeaturedArtisans() {
  return prisma.artisanProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { rating: "desc" },
    take: 4,
  })
}

export default async function LandingPage() {
  const { userId } = await auth()
  const [featured, loggedInUser] = await Promise.all([
    getFeaturedArtisans().catch(() => []),
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { role: true, name: true } }).catch(() => null)
      : Promise.resolve(null),
  ])

  const userRole = loggedInUser?.role
  const dashboardHref =
    userRole === "ADMIN"
      ? "/admin/dashboard"
      : userRole === "ARTISAN"
      ? "/artisan/dashboard"
      : "/customer/dashboard"
  const dashboardLabel =
    userRole === "ADMIN"
      ? "Admin Panel"
      : userRole === "ARTISAN"
      ? "Artisan Dashboard"
      : "Customer Portal"

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      <SiteBanner />
      <nav className="bg-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <BrandIcon className="h-7 w-7" priority />
            CraftConnect
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/90">
            <Link href="/customer/browse" className="hover:text-white transition">Browse</Link>
            <Link href="#how-it-works" className="hover:text-white transition">How it works</Link>
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/artisan-apply" className="hover:text-white transition">For artisans</Link>
          </div>
          <div className="flex items-center gap-3">
            {userId ? (
              <>
                <Link
                  href={dashboardHref}
                  className="bg-white text-emerald-700 text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <LayoutDashboard size={15} />
                  {dashboardLabel}
                </Link>
                <div className="ml-1 flex items-center">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-semibold text-white/90 hover:text-white transition">
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-white text-emerald-700 text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition font-semibold"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden min-h-[580px] flex items-center pt-14 pb-20 px-4">
        <Image
          src="/images/hero-artisans.jpg"
          alt="Artisans and tradespeople at Accra Community Skills Hub"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/65 to-emerald-950/80" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="inline-block text-xs font-bold tracking-wider uppercase bg-emerald-700/50 px-3 py-1 rounded-full mb-4 text-emerald-100">
            Trusted local trades in Ghana
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Find a verified artisan. Book in minutes.
          </h1>
          <p className="text-emerald-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Plumbing, electrical, carpentry, painting, and more, with secure Paystack payments and real customer reviews.
          </p>

          <form action="/customer/browse" method="get" className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 text-left">
            <label className="flex-1">
              <span className="block text-xs font-semibold text-slate-600 mb-1 px-1">Service</span>
              <span className="relative block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  type="search"
                  placeholder="Plumber, electrician…"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </span>
            </label>
            <label className="flex-1">
              <span className="block text-xs font-semibold text-slate-600 mb-1 px-1">Location</span>
              <span className="relative block">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="location"
                  type="text"
                  placeholder="Accra, Kumasi…"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </span>
            </label>
            <button
              type="submit"
              className="sm:self-end h-[46px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-emerald-50 font-medium mt-6">
            <span className="flex items-center gap-1.5"><Check size={16} /> Verified artisans</span>
            <span className="flex items-center gap-1.5"><Check size={16} /> Secure booking</span>
            <span className="flex items-center gap-1.5"><Check size={16} /> Local professionals</span>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">What can we help you with?</h2>
            <p className="text-slate-500 text-sm">Browse trades that match how artisans list on CraftConnect.</p>
          </div>
          <Link href="/customer/browse" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/customer/browse?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="relative h-32 bg-slate-100">
                <Image
                  src={ARTISAN_CATEGORY_PHOTOS[cat.name]}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">How it works</h2>
          <p className="text-slate-500 text-sm mb-10">Four steps from search to a finished job.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.step} className="rounded-2xl border border-slate-100 p-5">
                <div className="text-emerald-600 font-bold text-sm mb-3">{step.step}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Are you a skilled artisan?</h2>
            <p className="text-slate-300 mb-6">
              Apply once, get reviewed by our team, then start receiving bookings and Paystack payouts.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Verified customer jobs</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> You set your rates</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Secure payments</li>
            </ul>
            <Link
              href="/artisan-apply"
              className="inline-flex bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-3 rounded-xl transition"
            >
              Become an artisan
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top rated artisans</h2>
          <Link href="/customer/browse" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.length > 0 ? featured.map((a) => {
            const artisanPhoto = getArtisanPhoto(a.user.name, a.category)

            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {artisanPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={artisanPhoto} className="w-full h-full object-cover" alt={`${a.category} artisan ${a.user.name}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                          {a.user.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.user.name}</h3>
                      <p className="text-sm text-emerald-600">{a.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      {a.rating.toFixed(1)}
                      <span className="text-slate-400 font-normal">({a.totalReviews})</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                    <MapPin size={14} /> {a.location}
                  </p>
                  <p className="font-semibold text-slate-900">From GHS {a.pricePerHour}/hr</p>
                </div>
                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    href={`/customer/artisan/${a.userId}`}
                    className="flex-1 text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Profile
                  </Link>
                  <Link
                    href={`/customer/booking/${a.userId}`}
                    className="flex-1 text-center py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                  >
                    Book
                  </Link>
                </div>
              </div>
            )
          }) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
              No approved artisans yet. Check back soon, or apply to join.
            </div>
          )}
        </div>
      </section>

      <footer className="border-t bg-slate-950 text-slate-400 px-4 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <BrandIcon className="h-7 w-7 ring-1 ring-emerald-900/60" />
            CraftConnect
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/customer/browse" className="hover:text-white transition">Browse artisans</Link>
            <Link href="/artisan-apply" className="hover:text-white transition">Join as artisan</Link>
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} CraftConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
