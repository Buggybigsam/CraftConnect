import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import AdminReviewActions from "./_actions"

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ flagged?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const flaggedOnly = (await searchParams).flagged !== "false"

  const reviews = await prisma.review.findMany({
    where: {
      removedAt: null,
      ...(flaggedOnly ? { flagged: true } : {}),
    },
    include: {
      customer: { select: { name: true, email: true } },
      artisan: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Review moderation</h1>
        <p className="text-slate-500 text-sm mb-6">Flagged reviews and takedown actions.</p>

        <div className="flex gap-2 mb-6">
          <Link
            href="/admin/reviews"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
              flaggedOnly ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Flagged queue
          </Link>
          <Link
            href="/admin/reviews?flagged=false"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
              !flaggedOnly ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            All reviews
          </Link>
        </div>

        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{review.artisan.user.name}</div>
                  <div className="text-xs text-slate-400">{review.customer.name} · {review.customer.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {review.flagged && <StatusBadge value="FLAGGED" styles={{ FLAGGED: "bg-amber-50 text-amber-700 border-amber-100" }} />}
                  <span className="text-sm font-semibold text-amber-500">{review.rating}/5</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
              <div className="mt-3">
                <AdminReviewActions reviewId={review.id} flagged={review.flagged} />
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
              {flaggedOnly ? "No flagged reviews." : "No reviews yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
