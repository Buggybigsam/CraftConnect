import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ArtisanBookingList from "../dashboard/_booking-list"
import { CalendarDays, List } from "lucide-react"

export default async function ArtisanBookingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "ARTISAN") redirect("/")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
  })

  if (!artisan) redirect("/artisan-apply")

  const bookings = await prisma.booking.findMany({
    where: { artisanId: artisan.id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const now = new Date()
  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    date: b.date.toISOString(),
    notes: b.notes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    isNew: now.getTime() - b.createdAt.getTime() < 24 * 60 * 60 * 1000,
    customer: {
      name: b.customer.name,
      email: b.customer.email,
      phone: b.customer.phone,
    },
    service: {
      id: b.service.id,
      title: b.service.title,
      price: b.service.price,
      category: b.service.category,
    },
    payment: b.payment
      ? {
          id: b.payment.id,
          amount: b.payment.amount,
          currency: b.payment.currency,
          status: b.payment.status,
          reference: b.payment.reference,
          paidAt: b.payment.paidAt ? b.payment.paidAt.toISOString() : null,
        }
      : null,
  }))

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bookings & Calendar</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your schedule and customer reservations.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button className="flex items-center gap-2 px-4 py-2 bg-white shadow-sm text-slate-900 text-sm font-medium rounded-lg">
              <List size={16} /> List
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-medium rounded-lg transition">
              <CalendarDays size={16} /> Calendar
            </button>
          </div>
        </div>

        <ArtisanBookingList bookings={serializedBookings} />
      </div>
    </div>
  )
}
