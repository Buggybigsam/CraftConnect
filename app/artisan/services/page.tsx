import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Plus, MoreVertical, Edit, Trash } from "lucide-react"

export default async function ArtisanServicesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "ARTISAN") redirect("/")

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
    include: { services: { orderBy: { createdAt: "desc" } } }
  })

  if (!artisan) redirect("/artisan-apply")

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services & Portfolio</h1>
            <p className="text-slate-500 text-sm mt-1">Manage what you offer to customers.</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Plus size={16} /> Add Service
          </button>
        </div>

        {artisan.services.length === 0 ? (
          <div className="text-center py-24 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-base font-medium mb-1">No services added yet</p>
            <p className="text-sm">Create your first service to start getting bookings.</p>
            <button className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition">
              Create Service
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artisan.services.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 truncate pr-4">{s.title}</h3>
                  <button className="text-slate-400 hover:text-slate-900">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="text-xs text-emerald-600 font-medium mb-3">{s.category}</div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{s.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-900">GHS {s.price}</span>
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-slate-700 transition">
                      <Edit size={14} />
                    </button>
                    <button className="text-slate-400 hover:text-red-600 transition">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
