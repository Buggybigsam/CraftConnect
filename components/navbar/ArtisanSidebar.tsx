"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  Settings, 
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react"
import { useState } from "react"
import BrandIcon from "@/components/brand-icon"

export default function ArtisanSidebar() {
  const path = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navGroups = [
    {
      title: "Operations",
      items: [
        { href: "/artisan/dashboard",    label: "Overview",     icon: LayoutDashboard },
        { href: "/artisan/bookings",     label: "Bookings",     icon: CalendarCheck },
        { href: "/artisan/availability", label: "Availability", icon: Clock },
      ],
    },
    {
      title: "Business",
      items: [
        { href: "/artisan/services",     label: "Services",     icon: Briefcase },
        { href: "/artisan/earnings",     label: "Earnings",     icon: TrendingUp },
        { href: "/artisan/reviews",      label: "Reviews",      icon: Star },
      ],
    },
    {
      title: "Communication",
      items: [
        { href: "/artisan/messages",     label: "Messages",     icon: MessageSquare },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/artisan/profile",      label: "Public Profile", icon: User },
        { href: "/artisan/settings",     label: "Settings",       icon: Settings },
      ],
    },
  ]

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-sm group">
          <BrandIcon className="h-8 w-8 rounded-xl shadow-md shadow-emerald-950 ring-1 ring-emerald-900/60" priority />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight">CraftConnect</span>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest -mt-0.5">
              Artisan Pro
            </span>
          </div>
        </Link>
        <button
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          onClick={() => setIsOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Pro Badge Callout */}
      <div className="px-3 pt-3">
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-800/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Verified Artisan</p>
              <p className="text-[10px] text-slate-400">Ghana Partner Network</p>
            </div>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Grouped Nav Items */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-3 py-1">
              {group.title}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                path === href ||
                (href !== "/artisan/dashboard" && path.startsWith(href))

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900 font-bold"
                      : "text-slate-200 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={16}
                      className={
                        active
                          ? "text-white"
                          : "text-slate-300 group-hover:text-emerald-400"
                      }
                    />
                    <span>{label}</span>
                  </div>
                  {active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  ) : (
                    <ChevronRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile & Links */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 mt-auto space-y-2">
        <Link
          href="/customer/browse"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-200 transition"
        >
          <span>Marketplace</span>
          <ExternalLink size={12} className="text-slate-400" />
        </Link>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">My Account</span>
              <span className="text-[10px] text-emerald-400">Active Pro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <Link href="/artisan/dashboard" className="flex items-center gap-2 font-bold text-white text-sm">
          <BrandIcon className="h-7 w-7 ring-1 ring-emerald-900/60" priority />
          <span className="font-bold">CraftConnect <span className="text-xs font-normal text-emerald-400">Pro</span></span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>
    </>
  )
}
