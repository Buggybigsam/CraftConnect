import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export async function GET() {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const alerts = await prisma.adminAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const unreadCount = alerts.filter((a) => !a.isRead).length
  return NextResponse.json({ alerts, unreadCount })
}

export async function PATCH(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { alertId, action } = await request.json()
  if (action === "readAll") {
    await prisma.adminAlert.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true })
  }

  if (!alertId || action !== "read") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  try {
    await prisma.adminAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    })
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "P2025") {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }
    throw err
  }

  return NextResponse.json({ success: true })
}
