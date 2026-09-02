export default function ArtisanDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome header */}
        <div className="mb-8 space-y-2">
          <div className="h-7 bg-slate-200 rounded-md w-52" />
          <div className="h-4 bg-slate-200 rounded-md w-36" />
        </div>

        {/* 3 Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-16" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-12" />
            </div>
          ))}
        </div>

        {/* Bookings header */}
        <div className="h-5 bg-slate-200 rounded w-32 mb-4" />

        {/* Bookings list */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-40" />
                  <div className="h-3.5 bg-slate-100 rounded w-48" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-5 bg-slate-100 rounded-full w-20 ml-auto" />
                  <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
