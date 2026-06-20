import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { ArrowLeft, MapPin, Star, Clock } from "lucide-react"
import BookingForm from "./_form"

export default async function BookingPage({
  params,
}: {
  params: Promise<{ artisanId: string }>
}) {
  const { artisanId } = await params
  const { userId } = await auth()

  const artisan = await prisma.artisanProfile.findFirst({
    where:   { userId: artisanId, status: "APPROVED" },
    include: { user: true, services: true },
  })

  if (!artisan) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/customer/artisan/${artisanId}`} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm transition mb-5">
          <ArrowLeft size={14} /> Back to profile
        </Link>

        {/* Artisan mini-card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-lg font-bold text-indigo-400">
            {artisan.user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900">{artisan.user.name}</div>
            <div className="text-xs text-indigo-600 font-medium">{artisan.category}</div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin size={10} />{artisan.location}</span>
              <span className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" />{artisan.rating.toFixed(1)} ({artisan.totalReviews})</span>
              <span className="flex items-center gap-1"><Clock size={10} />GHS {artisan.pricePerHour}/hr</span>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-1">Book {artisan.user.name}</h1>
        <p className="text-slate-500 text-sm mb-5">Choose a service, pick a time, and confirm your booking.</p>

        <BookingForm
          artisanUserId={artisan.userId}
          artisanName={artisan.user.name}
          services={artisan.services}
          customerId={userId!}
        />
      </div>
    </div>
  )
}
