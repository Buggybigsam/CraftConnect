import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import BookingForm from "./_form"

export default async function BookingPage({
  params,
}: {
  params: Promise<{ artisanId: string }>
}) {
  const { artisanId } = await params
  const { userId } = await auth()

  const artisan = await prisma.artisanProfile.findFirst({
    where: { userId: artisanId, status: "APPROVED" },
    include: { user: true, services: true },
  })

  if (!artisan) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <a href={`/customer/artisan/${artisanId}`} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back to profile
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Book {artisan.user.name}</h1>
        <p className="text-gray-500 text-sm mb-6">{artisan.category} · GHS {artisan.pricePerHour}/hr</p>

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
