"use client"

import { Download } from "lucide-react"
import { toast } from "sonner"

interface BookingItem {
  id: string
  date: string
  status: string
  createdAt: string
  customer: {
    name: string
    email: string
    phone: string | null
  }
  service: {
    title: string
    price: number
    category: string
  }
  payment: {
    amount: number
    currency: string
    status: string
    reference: string
    paidAt: string | null
  } | null
}

interface Props {
  bookings: BookingItem[]
}

export default function ExportBookingsButton({ bookings }: Props) {
  function handleExport() {
    if (bookings.length === 0) {
      toast.error("No bookings to export")
      return
    }

    const headers = [
      "Booking ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Service Title",
      "Category",
      "Price (GHS)",
      "Appointment Date",
      "Booking Status",
      "Payment Status",
      "Payment Amount",
      "Payment Ref",
      "Created At",
    ]

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.customer.name.replace(/"/g, '""')}"`,
      `"${b.customer.email.replace(/"/g, '""')}"`,
      `"${(b.customer.phone || "").replace(/"/g, '""')}"`,
      `"${b.service.title.replace(/"/g, '""')}"`,
      `"${b.service.category.replace(/"/g, '""')}"`,
      b.service.price,
      `"${new Date(b.date).toLocaleString("en-GH")}"`,
      `"${b.status}"`,
      `"${b.payment?.status || "UNPAID"}"`,
      b.payment?.amount || 0,
      `"${b.payment?.reference || ""}"`,
      `"${new Date(b.createdAt).toLocaleString("en-GH")}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `CraftConnect_artisan_bookings_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Bookings exported as CSV")
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
    >
      <Download size={13} />
      Export CSV
    </button>
  )
}
