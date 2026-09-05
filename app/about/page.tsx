import Link from "next/link"
import { BadgeCheck, Shield, Clock, Users, ArrowRight, ArrowLeft } from "lucide-react"
import BrandIcon from "@/components/brand-icon"

export const metadata = {
  title: "About Us - CraftConnect",
  description: "Learn about CraftConnect's mission to connect people with verified local artisans.",
}

const VALUES = [
  {
    Icon: BadgeCheck,
    title: "Vetted & Verified",
    desc: "Every artisan profile undergoes a thorough background check and manual verification before going live.",
  },
  {
    Icon: Shield,
    title: "Secure & Transparent",
    desc: "Upfront pricing, transparent reviews from real customers, and protected payments on every booking.",
  },
  {
    Icon: Clock,
    title: "Fast & Convenient",
    desc: "Book skilled tradespeople in minutes without endless phone calls or uncertainty.",
  },
  {
    Icon: Users,
    title: "Empowering Local Trades",
    desc: "Helping hard-working local artisans grow their businesses and connect with dependable clients.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <BrandIcon className="h-7 w-7" priority />
            CraftConnect
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/customer/browse" className="text-sm text-white/90 hover:text-white transition">
              Browse Artisans
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-emerald-100 hover:text-white transition">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-b from-emerald-600 to-emerald-500 py-16 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-wider uppercase bg-emerald-700/60 px-3 py-1 rounded-full mb-3 text-emerald-100">
            About CraftConnect
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Connecting You with Ghana&apos;s Best Local Artisans
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            We are building the most trusted marketplace for skilled trade services, making finding reliable electricians, plumbers, painters, and carpenters effortless.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-12">
        {/* Template notice banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-4">
          <p className="font-semibold mb-0.5">Template Notice</p>
          <p>This is placeholder content for CraftConnect&apos;s About page. Update this section with your company&apos;s founders, milestones, and brand narrative before launching.</p>
        </div>

        {/* Mission & Story */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Finding dependable home and commercial service professionals used to mean asking neighbors, bargaining blindly, and dealing with unreliable schedules.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              CraftConnect bridges this gap by creating an open, transparent platform where skilled professionals are rewarded for quality work, and clients can book with absolute confidence.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">500+</div>
                <div className="text-xs text-slate-600 mt-1">Verified Artisans</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">12+</div>
                <div className="text-xs text-slate-600 mt-1">Cities in Ghana</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">98%</div>
                <div className="text-xs text-slate-600 mt-1">Satisfaction Rate</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">24hr</div>
                <div className="text-xs text-slate-600 mt-1">Application Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">What Sets Us Apart</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-slate-900 rounded-3xl p-8 text-center text-white space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Ready to get started?</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Explore verified artisans near you or apply to join our growing network of trade professionals.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/customer/browse"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Browse Artisans <ArrowRight size={15} />
            </Link>
            <Link
              href="/artisan-apply"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Join as Artisan
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-950 text-slate-400 px-4 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <BrandIcon className="h-7 w-7 ring-1 ring-emerald-900/60" />
            CraftConnect
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/customer/browse" className="hover:text-white transition">Browse Artisans</Link>
            <Link href="/artisan-apply" className="hover:text-white transition">Join as Artisan</Link>
            <Link href="/about" className="text-white transition">About Us</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} CraftConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
