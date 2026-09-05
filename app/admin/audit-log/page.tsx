import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminPagination } from "@/components/ui/admin-pagination"
import { ADMIN_PAGE_SIZE, parsePage, buildSearchQuery } from "@/lib/admin-query"

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; adminId?: string; action?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const adminId = params.adminId || undefined
  const action = params.action || undefined
  const page = parsePage(params.page)
  const where = {
    ...(adminId ? { adminId } : {}),
    ...(action ? { action } : {}),
  }

  const [total, logs, admins, actions] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.adminAuditLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Audit log</h1>
        <p className="text-slate-500 text-sm mb-6">Privileged admin mutations recorded on the platform.</p>

        <form method="get" className="flex flex-wrap gap-2 mb-4">
          <select name="adminId" defaultValue={adminId ?? ""} className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
            <option value="">All admins</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select name="action" defaultValue={action ?? ""} className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a.action} value={a.action}>{a.action}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800">
            Filter
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">When</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Admin</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString("en-GH")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{log.admin.name}</div>
                    <div className="text-xs text-slate-400">{log.admin.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{log.action}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {log.targetType} · {log.targetId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No audit entries yet.</div>
          )}
          <AdminPagination
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            total={total}
            pageSize={ADMIN_PAGE_SIZE}
            hrefForPage={(p) => `/admin/audit-log${buildSearchQuery({ adminId, action }, p)}`}
          />
        </div>
      </div>
    </div>
  )
}
