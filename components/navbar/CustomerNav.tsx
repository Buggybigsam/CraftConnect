"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Zap, Search, CalendarDays } from "lucide-react"

export default function CustomerNav() {
  const path = usePathname()

  const links = [
    {
      href:   "/customer/browse",
      label:  "Browse",
      icon:   Search,
      active: path.startsWith("/customer/browse") || path.startsWith("/customer/artisan") || path.startsWith("/customer/booking"),
    },
    {
      href:   "/customer/dashboard",
      label:  "My Bookings",
      icon:   CalendarDays,
      active: path.startsWith("/customer/dashboard"),
    },
  ]

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <span className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center shrink-0">
            <Zap size={12} className="text-white" />
          </span>
          SmartBooking
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        <UserButton />
      </div>
    </nav>
  )
}
