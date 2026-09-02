export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="h-7 bg-slate-200 rounded-md w-36 mb-6" />

        {/* 4 Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2 flex flex-col items-center">
              <div className="h-8 bg-slate-200 rounded w-16" />
              <div className="h-3.5 bg-slate-100 rounded w-24" />
            </div>
          ))}
        </div>

        {/* Pending applications header */}
        <div className="h-5 bg-slate-200 rounded w-56 mb-4" />

        {/* Pending cards */}
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-44" />
                <div className="h-3.5 bg-slate-100 rounded w-28" />
                <div className="flex gap-3 pt-1">
                  <div className="h-3 bg-slate-100 rounded w-20" />
                  <div className="h-3 bg-slate-100 rounded w-20" />
                  <div className="h-3 bg-slate-100 rounded w-20" />
                </div>
                <div className="h-10 bg-slate-100 rounded-lg w-full mt-2" />
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <div className="h-9 bg-slate-200 rounded-lg flex-1" />
                <div className="h-9 bg-slate-100 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
