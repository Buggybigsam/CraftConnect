import Link from "next/link"
import { Zap, Compass, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-emerald-600" />
            </span>
            SmartBooking
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/customer/browse" className="text-sm text-white/90 hover:text-white transition">
              Browse Artisans
            </Link>
            <Link href="/artisan-apply" className="hidden sm:block text-sm text-white/90 hover:text-white transition">
              For Artisans
            </Link>
            <Link
              href="/"
              className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded-md hover:bg-orange-600 transition font-bold"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <Compass size={40} className="stroke-[1.75]" />
          </div>
          <span className="inline-block text-xs font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100/60 px-3 py-1 rounded-full mb-3">
            Error 404
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            The page you are looking for doesn&apos;t exist, was removed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <Link
              href="/customer/browse"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Browse Artisans
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-950 text-slate-400 px-4 py-8 mt-auto">
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
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} SmartBooking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
