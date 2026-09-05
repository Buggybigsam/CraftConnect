import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { email, FROM_EMAIL } from "@/lib/email"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import { requireAdmin, writeAuditLog, createAdminAlert } from "@/lib/admin"

const ADMIN_ARTISANS_RATE_LIMIT = 30
const ADMIN_ARTISANS_RATE_WINDOW_MS = 60 * 1000

const ALLOWED_STATUSES = ["APPROVED", "REJECTED", "PENDING"] as const

export async function GET(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const artisans = await prisma.artisanProfile.findMany({
    where: status && ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])
      ? { status: status as (typeof ALLOWED_STATUSES)[number] }
      : undefined,
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(artisans)
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimit = checkRateLimit(
    `admin-artisans:${getClientIp(request)}`,
    ADMIN_ARTISANS_RATE_LIMIT,
    ADMIN_ARTISANS_RATE_WINDOW_MS
  )
  if (!rateLimit.ok) return rateLimitResponse(rateLimit)

  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { artisanProfileId, status } = await request.json()

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  let updatedProfile
  try {
    updatedProfile = await prisma.artisanProfile.update({
      where: { id: artisanProfileId },
      data: { status },
      include: { user: { select: { email: true, name: true } } },
    })
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "P2025") {
      return NextResponse.json({ error: "Artisan profile not found" }, { status: 404 })
    }
    throw err
  }

  await writeAuditLog(authz.admin.id, `ARTISAN_${status}`, "ArtisanProfile", artisanProfileId, {
    previousDecisionReversed: true,
    artisanEmail: updatedProfile.user.email,
  })

  const artisanEmail = updatedProfile.user.email
  const artisanName = updatedProfile.user.name

  if (status === "PENDING") {
    await createAdminAlert({
      type: "PENDING_ARTISAN",
      title: "Artisan application reopened",
      message: `${artisanName} was moved back to pending review.`,
      link: "/admin/artisans",
    })
    return NextResponse.json({ success: true })
  }

  const message =
    status === "APPROVED"
      ? `<p>Hi ${artisanName}, your CraftConnect artisan profile has been <strong>approved</strong>! You can now log in and start receiving bookings.</p>`
      : `<p>Hi ${artisanName}, unfortunately your CraftConnect artisan application was <strong>not approved</strong> at this time. Please contact support for more information.</p>`

  await email.send({
    from: FROM_EMAIL,
    to: artisanEmail,
    subject: status === "APPROVED" ? "Your Profile is Approved - CraftConnect" : "Application Update - CraftConnect",
    html: message,
  }).catch(console.error)

  return NextResponse.json({ success: true })
}
