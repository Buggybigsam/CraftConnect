import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  hrefForPage,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  hrefForPage: (page: number) => string
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages} · showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <ChevronLeft size={14} /> Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 border border-slate-100 rounded-lg cursor-not-allowed">
            <ChevronLeft size={14} /> Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={hrefForPage(page + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Next <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 border border-slate-100 rounded-lg cursor-not-allowed">
            Next <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  )
}
