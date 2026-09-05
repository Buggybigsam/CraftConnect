import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ARTISAN_CATEGORIES } from "@/lib/artisan-categories"
import type { Prisma } from "@/lib/generated/prisma/client"

export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN" || admin.status === "SUSPENDED") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { admin }
}

export async function writeAuditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Prisma.InputJsonValue
) {
  await prisma.adminAuditLog.create({
    data: { adminId, action, targetType, targetId, metadata },
  })
}

export async function createAdminAlert(data: {
  type: string
  title: string
  message: string
  link?: string
}) {
  try {
    await prisma.adminAlert.create({ data })
  } catch (err) {
    console.error(err)
  }
}

export async function getOrCreatePlatformConfig() {
  return prisma.platformConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      platformFeePercent: 10,
      categories: ARTISAN_CATEGORIES,
      announcementBanner: "",
    },
  })
}

export function computeCommission(amount: number, platformFeePercent: number) {
  return Math.round(amount * platformFeePercent) / 100
}
