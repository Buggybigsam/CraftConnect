import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Clock, CalendarOff } from "lucide-react"

export default async function ArtisanAvailabilityPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Availability Management</h1>
          <p className="text-slate-500 text-sm mt-1">Set your working hours and block out dates.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Clock className="text-emerald-600" size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Working Hours</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">Define your recurring weekly schedule so customers know when they can book you.</p>
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-sm">Interactive weekly scheduler coming soon.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <CalendarOff className="text-rose-600" size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Blocked Dates</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">Add specific dates or date ranges when you will not be available for bookings.</p>
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-sm">Blocked date manager coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
