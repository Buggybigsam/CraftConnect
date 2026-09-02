export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-14 bg-emerald-600/90 w-full" />

      {/* Hero skeleton */}
      <div className="bg-emerald-600/70 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 bg-emerald-500/60 rounded-lg w-2/3 mx-auto" />
          <div className="h-14 bg-white/30 rounded-xl max-w-2xl mx-auto" />
        </div>
      </div>

      {/* Cards skeleton grid */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="h-6 bg-slate-200 rounded-md w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="pt-2 flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-16" />
                <div className="h-4 bg-slate-200 rounded w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
