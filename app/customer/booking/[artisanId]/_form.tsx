"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  title: string
  price: number
  description: string
}

interface Props {
  artisanUserId: string
  artisanName: string
  services: Service[]
  customerId: string
}

export default function BookingForm({ artisanUserId, services, customerId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedService, setSelectedService] = useState(services[0]?.id ?? "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const fd = new FormData(e.currentTarget)

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artisanUserId,
        customerId,
        serviceId: fd.get("serviceId"),
        date: fd.get("date"),
        notes: fd.get("notes"),
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Failed to create booking")
      setLoading(false)
      return
    }

    // Redirect to Paystack payment
    window.location.href = data.paymentUrl
  }

  const service = services.find((s) => s.id === selectedService)

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
      {/* Service selection */}
      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service *</label>
          <div className="space-y-2">
            {services.map((s) => (
              <label
                key={s.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  selectedService === s.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="serviceId"
                    value={s.id}
                    checked={selectedService === s.id}
                    onChange={() => setSelectedService(s.id)}
                    className="accent-indigo-600"
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{s.title}</div>
                    <div className="text-xs text-gray-500">{s.description}</div>
                  </div>
                </div>
                <div className="font-semibold text-indigo-700">GHS {s.price}</div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date & Time *</label>
        <input
          type="datetime-local"
          name="date"
          required
          min={new Date().toISOString().slice(0, 16)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Describe the job, location details, any specific requirements..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Summary */}
      {service && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Service</span>
            <span className="font-medium">{service.title}</span>
          </div>
          <div className="flex justify-between text-gray-900 font-semibold mt-2 text-base">
            <span>Total</span>
            <span>GHS {service.price}</span>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !selectedService}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Proceed to Payment"}
      </button>
    </form>
  )
}
