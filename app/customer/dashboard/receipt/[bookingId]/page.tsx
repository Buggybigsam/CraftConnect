import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShieldCheck, Calendar, MapPin, Phone, Mail } from "lucide-react"
import PrintButton from "./_print-button"

export default async function BookingReceiptPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const viewer = await prisma.user.findUnique({ where: { id: userId } })
  if (!viewer) redirect("/auth/redirect")
  if (viewer.role === "ARTISAN") redirect("/artisan/dashboard")
  if (viewer.role === "ADMIN") redirect("/admin/dashboard")

  const { bookingId } = await params

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      artisan: {
        include: {
          user: true,
        },
      },
      service: true,
      payment: true,
    },
  })

  if (!booking || booking.customerId !== userId) {
    notFound()
  }

  const payment = booking.payment
  const isPaid = payment?.status === "SUCCESS"

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </Link>
          <PrintButton />
        </div>

        {/* Receipt Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 print:shadow-none print:border-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xl tracking-tight text-slate-900">CraftConnect</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                  Official Receipt
                </span>
              </div>
              <p className="text-xs text-slate-400">Transaction Ref: {payment?.reference ?? `BK-${booking.id.slice(0, 8)}`}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {isPaid ? <CheckCircle2 size={13} /> : null}
                {isPaid ? "PAID" : "PAYMENT PENDING"}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {booking.createdAt.toLocaleDateString("en-GH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Customer & Artisan Info */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Billed To</span>
              <div className="font-bold text-slate-900">{booking.customer.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Mail size={12} /> {booking.customer.email}
              </div>
              {booking.customer.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Phone size={12} /> {booking.customer.phone}
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Service Provider</span>
              <div className="font-bold text-slate-900">{booking.artisan.user.name}</div>
              <div className="text-xs text-emerald-600 font-medium">{booking.artisan.category}</div>
              {booking.artisan.location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin size={12} /> {booking.artisan.location}
                </div>
              )}
              {booking.artisan.user.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Phone size={12} /> {booking.artisan.user.phone}
                </div>
              )}
            </div>
          </div>

          {/* Service & Booking Details */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Service Details</span>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-slate-400">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Appointment Slot</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <div className="font-medium text-slate-900">{booking.service.title}</div>
                    <div className="text-xs text-slate-400">{booking.service.description}</div>
                  </td>
                  <td className="py-3 text-xs text-slate-600">
                    <div className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {new Date(booking.date).toLocaleDateString("en-GH", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    GHS {booking.service.price.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8">
            <div className="flex justify-between items-center text-sm mb-2 text-slate-600">
              <span>Subtotal</span>
              <span>GHS {booking.service.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-3 text-slate-600">
              <span>Platform / Processing Fee</span>
              <span>GHS 0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-base font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-700">
                GHS {payment?.amount ? payment.amount.toFixed(2) : booking.service.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center pt-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verified Paystack Payment · CraftConnect Escrow Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  )
}
