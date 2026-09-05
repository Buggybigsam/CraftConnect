"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

const ROLES = ["CUSTOMER", "ARTISAN", "ADMIN"] as const

export default function AdminUserActions({
  userId,
  role,
  status,
  isSelf,
}: {
  userId: string
  role: string
  status: string
  isSelf: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [modal, setModal] = useState<"suspend" | "reinstate" | "setRole" | null>(null)
  const [nextRole, setNextRole] = useState(role)

  async function run(action: "suspend" | "reinstate" | "setRole") {
    setPending(true)
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role: nextRole }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(data?.error ?? "Action failed")
      setPending(false)
      return
    }
    toast.success(action === "setRole" ? "Role updated" : action === "suspend" ? "User suspended" : "User reinstated")
    setModal(null)
    setPending(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {status === "ACTIVE" ? (
        <button
          type="button"
          disabled={isSelf}
          onClick={() => setModal("suspend")}
          className="px-2 py-1 text-xs font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50 disabled:opacity-40"
        >
          Suspend
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setModal("reinstate")}
          className="px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-50"
        >
          Reinstate
        </button>
      )}
      <button
        type="button"
        disabled={isSelf}
        onClick={() => {
          setNextRole(role)
          setModal("setRole")
        }}
        className="px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
      >
        Change role
      </button>

      {modal === "suspend" && (
        <ConfirmModal
          title="Suspend this user?"
          description="They will lose access to protected areas until reinstated."
          confirmLabel="Suspend"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run("suspend")}
        />
      )}
      {modal === "reinstate" && (
        <ConfirmModal
          title="Reinstate this user?"
          description="They will regain access with their current role."
          confirmLabel="Reinstate"
          confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run("reinstate")}
        />
      )}
      {modal === "setRole" && (
        <ConfirmModal
          title="Change this user's role?"
          description="This updates both the database and Clerk public metadata."
          confirmLabel="Update role"
          confirmClassName="bg-violet-600 hover:bg-violet-700 text-white"
          pending={pending}
          onCancel={() => setModal(null)}
          onConfirm={() => run("setRole")}
        >
          <select
            value={nextRole}
            onChange={(e) => setNextRole(e.target.value)}
            className="w-full mb-4 text-sm border border-slate-200 rounded-xl px-3 py-2"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </ConfirmModal>
      )}
    </div>
  )
}
