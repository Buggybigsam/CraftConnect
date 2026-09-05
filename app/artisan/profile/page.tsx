import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import ArtisanProfileForm from "./_form"

export default async function ArtisanProfileEditPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "ARTISAN") redirect("/")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
    include: { user: true },
  })

  if (!artisan) redirect("/artisan-apply")

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <Link
          href="/artisan/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Edit Artisan Profile</h1>
              <p className="text-xs text-slate-400">
                Update your service offerings, rates, and public biography
              </p>
            </div>
          </div>

          <ArtisanProfileForm
            profile={{
              category: artisan.category,
              pricePerHour: artisan.pricePerHour,
              location: artisan.location,
              yearsExp: artisan.yearsExp,
              bio: artisan.bio,
            }}
          />
        </div>
      </div>
    </div>
  )
}
