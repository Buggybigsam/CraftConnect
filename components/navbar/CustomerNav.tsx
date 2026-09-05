"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Search, CalendarDays } from "lucide-react"
import BrandIcon from "@/components/brand-icon"

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
      label:  "Dashboard",
      icon:   CalendarDays,
      active: path.startsWith("/customer/dashboard"),
    },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/customer/dashboard" className="flex items-center gap-2.5 font-bold text-slate-950 text-sm">
          <BrandIcon className="h-8 w-8 shadow-sm ring-1 ring-slate-200" priority />
          <span className="hidden sm:inline">CraftConnect</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 hidden md:inline-block">
            Customer Portal
          </span>
        </Link>

        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          {links.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        <UserButton />
      </div>
    </nav>
  )
}
