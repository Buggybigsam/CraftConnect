import ArtisanSidebar from "@/components/navbar/ArtisanSidebar"
import Link from "next/link"
import { ExternalLink, Sparkles } from "lucide-react"

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100/70 font-sans text-slate-800">
      <ArtisanSidebar />
      
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Top Header Strip */}
        <header className="hidden md:flex h-14 bg-white/90 backdrop-blur border-b border-slate-200/80 px-6 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Artisan Pro Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">Portal Center</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </div>

            <Link
              href="/artisan/profile"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 px-3 py-1.5 rounded-xl transition"
            >
              <Sparkles size={13} className="text-emerald-600" />
              <span>Preview My Public Profile</span>
              <ExternalLink size={12} className="text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full min-w-0 pb-12">
          {children}
        </main>
      </div>
    </div>
  )
}
