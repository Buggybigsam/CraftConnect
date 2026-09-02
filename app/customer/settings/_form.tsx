"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { User, Phone, MapPin, Mail, Save } from "lucide-react"
import { updateCustomerProfileAction } from "./_actions"

interface Props {
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    location: string | null
  }
}

export default function CustomerProfileForm({ user }: Props) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || "")
  const [location, setLocation] = useState(user.location || "")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      const res = await updateCustomerProfileAction({ name, phone, location })
      if (res.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(res.error ?? "Failed to update profile")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
          />
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Email is managed via authentication.</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="tel"
            placeholder="+233 24 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          City / Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Accra, Ghana"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
        >
          <Save size={15} />
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
