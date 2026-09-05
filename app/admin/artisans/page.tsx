import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Briefcase, DollarSign } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ArtisanStatus } from "@/lib/generated/prisma/client"
import AdminArtisanDecisionActions from "./_actions"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-red-50 text-red-700 border-red-100",
}

const TABS: { value: ArtisanStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
]

export default async function AdminArtisansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const status = TABS.some((t) => t.value === params.status) && params.status !== "ALL"
    ? (params.status as ArtisanStatus)
    : undefined

  const artisans = await prisma.artisanProfile.findMany({
    where: status ? { status } : undefined,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Artisan applications</h1>
        <p className="text-slate-500 text-sm mb-6">Review, reverse, and reopen artisan decisions.</p>

        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => {
            const href = tab.value === "ALL" ? "/admin/artisans" : `/admin/artisans?status=${tab.value}`
            const active = (status ?? "ALL") === tab.value
            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                  active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {artisans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
            No artisans in this view.
          </div>
        ) : (
          <div className="space-y-3">
            {artisans.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900">{a.user.name}</div>
                      <StatusBadge value={a.status} styles={STATUS_STYLES} />
                    </div>
                    <div className="text-sm text-emerald-600 font-medium">{a.category}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={11} />{a.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{a.yearsExp} yrs exp</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} />GHS {a.pricePerHour}/hr</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{a.bio}</p>
                    <div className="text-xs text-slate-400 mt-1">{a.user.email} · {a.user.phone}</div>
                  </div>
                </div>
                <AdminArtisanDecisionActions artisanProfileId={a.id} status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
