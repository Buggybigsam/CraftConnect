export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title & subtitle */}
        <div className="h-7 bg-slate-200 rounded-md w-48 mb-2" />
        <div className="h-4 bg-slate-200 rounded-md w-64 mb-6" />

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 grid sm:grid-cols-3 gap-3">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 rounded-full shrink-0" />
          ))}
        </div>

        {/* Grid of artisan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              <div className="h-32 bg-slate-200 w-full" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-slate-200 rounded w-16" />
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
