import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { MessageSquareOff } from "lucide-react"

export default async function ArtisanMessagesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "ARTISAN") redirect("/")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
  })

  if (!artisan) redirect("/artisan-apply")

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Communicate with customers regarding your bookings.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquareOff size={28} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">No Messages Yet</h2>
          <p className="text-slate-500 text-sm max-w-md">
            When customers send you inquiries about their bookings, they will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
