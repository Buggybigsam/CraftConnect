import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

const ROLE_STYLES: Record<string, string> = {
  CUSTOMER: "bg-indigo-50 text-indigo-700 border-indigo-100",
  ARTISAN:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  ADMIN:    "bg-violet-50 text-violet-700 border-violet-100",
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "text-amber-600",
  APPROVED: "text-emerald-600",
  REJECTED: "text-red-500",
}

export default async function AdminUsersPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const users = await prisma.user.findMany({
    include: { artisanProfile: { select: { status: true, category: true } } },
    orderBy: { createdAt: "desc" },
  })

  const customers = users.filter((u) => u.role === "CUSTOMER").length
  const artisans  = users.filter((u) => u.role === "ARTISAN").length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm transition">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-slate-200">|</span>
            <span className="font-bold text-slate-900">SmartBooking Admin</span>
          </div>
          <Link href="/admin/bookings" className="text-sm text-slate-600 hover:text-slate-900 transition">Bookings</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
            <p className="text-slate-500 text-sm mt-1">{users.length} total · {customers} customers · {artisans} artisans</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_STYLES[u.role]}`}>
                      {u.role}
                    </span>
                    {u.artisanProfile && (
                      <span className={`ml-2 text-xs font-medium ${STATUS_STYLES[u.artisanProfile.status]}`}>
                        {u.artisanProfile.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{u.location ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No users yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
