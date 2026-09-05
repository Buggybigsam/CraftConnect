import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { AdminPagination } from "@/components/ui/admin-pagination"
import { ADMIN_PAGE_SIZE, parsePage, buildSearchQuery } from "@/lib/admin-query"
import type { Prisma, Role, UserStatus } from "@/lib/generated/prisma/client"
import AdminUserActions from "./_actions"

const ROLE_STYLES: Record<string, string> = {
  CUSTOMER: "bg-emerald-50 text-emerald-700 border-emerald-100",
  ARTISAN:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  ADMIN:    "bg-violet-50 text-violet-700 border-violet-100",
}

const ACCOUNT_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  SUSPENDED: "bg-red-50 text-red-700 border-red-100",
}

const ROLES: Role[] = ["CUSTOMER", "ARTISAN", "ADMIN"]
const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED"]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string; status?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const role = ROLES.includes(params.role as Role) ? (params.role as Role) : undefined
  const status = STATUSES.includes(params.status as UserStatus) ? (params.status as UserStatus) : undefined
  const page = parsePage(params.page)

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [totalCount, users, customers, artisans] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { artisanProfile: { select: { status: true, category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "ARTISAN" } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
            <p className="text-slate-500 text-sm mt-1">{totalCount} matching · {customers} customers · {artisans} artisans</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-emerald-600" />
          </div>
        </div>

        <form method="get" className="flex flex-wrap gap-2 mb-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="flex-1 min-w-48 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
          />
          <select name="role" defaultValue={role ?? ""} className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select name="status" defaultValue={status ?? ""} className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
            <option value="">All account statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800">
            Filter
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge value={u.role} styles={ROLE_STYLES} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge value={u.status} styles={ACCOUNT_STYLES} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminUserActions userId={u.id} role={u.role} status={u.status} isSelf={u.id === userId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-slate-50">
            {users.map((u) => (
              <div key={u.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </div>
                  <StatusBadge value={u.role} styles={ROLE_STYLES} className="shrink-0" />
                </div>
                <AdminUserActions userId={u.id} role={u.role} status={u.status} isSelf={u.id === userId} />
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No users match these filters.</div>
          )}

          <AdminPagination
            page={currentPage}
            totalPages={totalPages}
            total={totalCount}
            pageSize={ADMIN_PAGE_SIZE}
            hrefForPage={(p) => `/admin/users${buildSearchQuery({ q, role, status }, p)}`}
          />
        </div>
      </div>
    </div>
  )
}
