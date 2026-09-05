import { clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, writeAuditLog } from "@/lib/admin"

const ROLES = ["CUSTOMER", "ARTISAN", "ADMIN"] as const

export async function PATCH(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { userId, action, role } = await request.json()
  if (!userId || !["suspend", "reinstate", "setRole"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  if (userId === authz.admin.id && (action === "suspend" || (action === "setRole" && role !== "ADMIN"))) {
    return NextResponse.json({ error: "You cannot change your own admin access" }, { status: 409 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (action === "suspend") {
    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "User is already suspended" }, { status: 409 })
    }
    await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" },
    })
    await writeAuditLog(authz.admin.id, "USER_SUSPEND", "User", userId)
    return NextResponse.json({ success: true })
  }

  if (action === "reinstate") {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    })
    await writeAuditLog(authz.admin.id, "USER_REINSTATE", "User", userId)
    return NextResponse.json({ success: true })
  }

  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Role updated in database but Clerk sync failed" }, { status: 500 })
  }

  await writeAuditLog(authz.admin.id, "USER_ROLE_CHANGE", "User", userId, {
    from: user.role,
    to: role,
  })
  return NextResponse.json({ success: true })
}
