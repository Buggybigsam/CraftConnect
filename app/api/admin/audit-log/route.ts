import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { ADMIN_PAGE_SIZE, parsePage } from "@/lib/admin-query"

export async function GET(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { searchParams } = new URL(request.url)
  const adminId = searchParams.get("adminId") ?? undefined
  const action = searchParams.get("action") ?? undefined
  const page = parsePage(searchParams.get("page") ?? undefined)

  const where = {
    ...(adminId ? { adminId } : {}),
    ...(action ? { action } : {}),
  }

  const [total, logs] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
  ])

  return NextResponse.json({ total, page, pageSize: ADMIN_PAGE_SIZE, logs })
}
