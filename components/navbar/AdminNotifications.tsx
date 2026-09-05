"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"

type Alert = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  async function load() {
    const res = await fetch("/api/admin/alerts")
    if (!res.ok) return
    const data = await res.json()
    setAlerts(data.alerts ?? [])
    setUnreadCount(data.unreadCount ?? 0)
  }

  useEffect(() => {
    setTimeout(() => {
      load()
    }, 0)
  }, [])

  async function markRead(alertId: string) {
    await fetch("/api/admin/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, action: "read" }),
    })
    load()
  }

  async function markAllRead() {
    await fetch("/api/admin/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "readAll" }),
    })
    load()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-emerald-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {alerts.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400">No alerts yet.</p>
            ) : (
              alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.link ?? "/admin/dashboard"}
                  onClick={() => {
                    if (!alert.isRead) markRead(alert.id)
                    setOpen(false)
                  }}
                  className={`block px-4 py-3 hover:bg-slate-50 ${alert.isRead ? "" : "bg-emerald-50/40"}`}
                >
                  <div className="text-xs font-semibold text-slate-900">{alert.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{alert.message}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
