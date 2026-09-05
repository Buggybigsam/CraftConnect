import Link from "next/link"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import BrandIcon from "@/components/brand-icon"

export const metadata = {
  title: "Privacy Policy - CraftConnect",
  description: "Learn how CraftConnect collects, uses, and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
            <BrandIcon className="h-7 w-7" priority />
            CraftConnect
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
          <p>This is placeholder legal copy for CraftConnect. Customize this policy with your organization&apos;s specific legal and regulatory disclosures.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <ShieldCheck size={13} /> Legal & Privacy
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 text-sm mt-1">Last updated: September 2026</p>
          </div>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">1. Information We Collect</h2>
            <p>
              CraftConnect collects information you provide directly to us when you create an account, apply as an artisan, book a service, or communicate with us. This includes your name, email address, phone number, location, payment information, and service preferences.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Facilitate bookings and connections between customers and verified artisans.</li>
              <li>Process payments and payouts securely via certified payment processors.</li>
              <li>Verify artisan credentials and maintain platform safety and trust.</li>
              <li>Send transaction notifications, booking confirmations, and support updates.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">3. Data Sharing & Disclosure</h2>
            <p>
              We do not sell your personal data. We share necessary contact and booking details between clients and artisans solely to fulfill booked services. We may also share data with trusted service providers (e.g. authentication, payment gateways) under strict confidentiality agreements.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">4. Data Security</h2>
            <p>
              We implement industry-standard encryption, access controls, and security practices to safeguard your personal data. Payment details are handled by PCI-DSS compliant payment gateways.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-semibold text-slate-900">5. Contact Us</h2>
            <p>
              If you have questions regarding this Privacy Policy or your personal information, please contact our data privacy team at <a href="mailto:privacy@CraftConnect.com" className="text-emerald-600 hover:underline">privacy@CraftConnect.com</a>.
            </p>
          </section>
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
            <Link href="/about" className="hover:text-white transition">About Us</Link>
            <Link href="/privacy" className="text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} CraftConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
