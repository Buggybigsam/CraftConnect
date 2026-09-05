import AdminSidebar from "@/components/navbar/AdminSidebar"
import AdminNav from "@/components/navbar/AdminNav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100/70 font-sans text-slate-800">
      <AdminSidebar />

      <div className="flex-1 flex flex-col w-full min-w-0">
        <AdminNav />

        <main className="flex-1 w-full min-w-0 pb-12">
          {children}
        </main>
      </div>
    </div>
  )
}
