import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getAnnouncementBanner = unstable_cache(
  async () => {
    try {
      const config = await prisma.platformConfig.findUnique({
        where: { id: "default" },
        select: { announcementBanner: true },
      })
      return config?.announcementBanner ?? ""
    } catch {
      return ""
    }
  },
  ["announcement-banner"],
  { revalidate: 120 }
)

export default async function SiteBanner() {
  const text = await getAnnouncementBanner()
  if (!text) return null
  return (
    <div className="bg-emerald-700 text-white text-sm text-center py-2 px-4">
      {text}
    </div>
  )
}
