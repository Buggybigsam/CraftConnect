export default function CustomerDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title & subtitle */}
        <div className="h-7 bg-slate-200 rounded-md w-40 mb-2" />
        <div className="h-4 bg-slate-200 rounded-md w-28 mb-6" />

        {/* Booking cards list */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-200 rounded w-36" />
                    <div className="h-5 bg-slate-100 rounded-full w-20" />
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded w-48" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                    <div className="h-3 bg-slate-100 rounded w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
