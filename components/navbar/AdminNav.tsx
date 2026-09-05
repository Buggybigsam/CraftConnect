"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Activity, Sparkles, ExternalLink } from "lucide-react"
import AdminNotifications from "./AdminNotifications"

export default function AdminNav() {
  const path = usePathname()

  // Derive breadcrumb from path
  const segments = path.split("/").filter(Boolean)
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  return (
    <header className="hidden md:flex h-14 bg-white/90 backdrop-blur border-b border-slate-200/80 px-6 items-center justify-between sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300">/</span>}
            {crumb.isLast ? (
              <span className="text-slate-900 font-bold">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-slate-700 transition">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-semibold text-emerald-700">
          <Activity size={12} />
          <span>Operational</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 px-3 py-1.5 rounded-xl transition"
        >
          <Sparkles size={13} className="text-emerald-600" />
          <span>Public Marketplace</span>
          <ExternalLink size={12} className="text-slate-400" />
        </Link>

        <AdminNotifications />
      </div>
    </header>
  )
}
