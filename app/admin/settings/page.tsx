import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getOrCreatePlatformConfig } from "@/lib/admin"
import PlatformSettingsForm from "./_form"

export default async function AdminSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") redirect("/")

  const config = await getOrCreatePlatformConfig()
  const categories = Array.isArray(config.categories) ? (config.categories as string[]) : []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Platform settings</h1>
        <p className="text-slate-500 text-sm mb-6">Commission, categories, and the site-wide announcement.</p>
        <PlatformSettingsForm
          platformFeePercent={config.platformFeePercent}
          categories={categories}
          announcementBanner={config.announcementBanner}
        />
      </div>
    </div>
  )
}
