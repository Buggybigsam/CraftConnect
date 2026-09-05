import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, writeAuditLog, getOrCreatePlatformConfig } from "@/lib/admin"

export async function GET() {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const config = await getOrCreatePlatformConfig()
  return NextResponse.json(config)
}

export async function PATCH(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const body = await request.json()
  const data: {
    platformFeePercent?: number
    categories?: string[]
    announcementBanner?: string
  } = {}

  if (body.platformFeePercent !== undefined) {
    const percent = Number(body.platformFeePercent)
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return NextResponse.json({ error: "platformFeePercent must be between 0 and 100" }, { status: 400 })
    }
    data.platformFeePercent = percent
  }

  if (body.categories !== undefined) {
    if (!Array.isArray(body.categories) || body.categories.some((c: unknown) => typeof c !== "string" || !c.trim())) {
      return NextResponse.json({ error: "categories must be a list of names" }, { status: 400 })
    }
    data.categories = body.categories.map((c: string) => c.trim())
  }

  if (body.announcementBanner !== undefined) {
    if (typeof body.announcementBanner !== "string") {
      return NextResponse.json({ error: "announcementBanner must be a string" }, { status: 400 })
    }
    data.announcementBanner = body.announcementBanner
  }

  await getOrCreatePlatformConfig()
  const updated = await prisma.platformConfig.update({
    where: { id: "default" },
    data,
  })

  await writeAuditLog(authz.admin.id, "SETTINGS_UPDATE", "PlatformConfig", "default", data)
  return NextResponse.json(updated)
}
