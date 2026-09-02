import Link from "next/link"
import { Zap, FileText, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service - SmartBooking",
  description: "Read the Terms of Service governing the use of SmartBooking platform.",
}

export default function TermsPage() {
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
          <Link href="/" className="flex items-center gap-1.5 text-sm text-emerald-100 hover:text-white transition">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        {/* Template notice banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-4 mb-8">
          <p className="font-semibold mb-0.5">Template Notice</p>
          <p>This is placeholder terms of service copy for SmartBooking. Please replace with your official legal terms before production launch.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <FileText size={13} /> Terms & Agreement
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-slate-500 text-sm mt-1">Last updated: September 2026</p>
          </div>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using SmartBooking, you agree to comply with and be legally bound by these Terms of Service and all applicable laws and regulations in Ghana.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">2. Artisan & Customer Obligations</h2>
            <p>
              <strong>Artisans:</strong> Must provide accurate credentials, maintain fair professional conduct, and deliver agreed services in a workmanlike manner.
            </p>
            <p>
              <strong>Customers:</strong> Agree to provide safe access to the service location, accurate job specifications, and timely payments through the platform.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">3. Payments & Cancellations</h2>
            <p>
              All service payments are processed securely through SmartBooking&apos;s integrated payment partners. Cancellation policies, refunds, and rescheduling terms apply according to the service booking terms.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">4. Limitation of Liability</h2>
            <p>
              SmartBooking connects verified artisans with customers. While we perform verification and moderation, we are not liable for direct disputes or damages outside our platform guarantee terms.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">5. Contact Support</h2>
            <p>
              For legal inquiries regarding these terms, reach us at <a href="mailto:legal@smartbooking.com" className="text-emerald-600 hover:underline">legal@smartbooking.com</a>.
            </p>
          </section>
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
            <Link href="/terms" className="text-white transition">Terms of Service</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} SmartBooking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
