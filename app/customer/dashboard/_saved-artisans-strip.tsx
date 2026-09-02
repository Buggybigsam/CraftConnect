import Link from "next/link"
import { Bookmark, Star, MapPin, User, ArrowRight } from "lucide-react"
import SavedArtisanButton from "./_saved-artisan-button"

interface SavedItem {
  id: string
  artisanId: string
  artisan: {
    id: string
    category: string
    location: string
    rating: number
    pricePerHour: number
    user: {
      name: string
      imageUrl: string | null
      phone: string | null
    }
  }
}

interface Props {
  savedArtisans: SavedItem[]
}

export default function SavedArtisansStrip({ savedArtisans }: Props) {
  if (savedArtisans.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bookmark size={14} className="fill-emerald-600" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Saved Artisans ({savedArtisans.length})</h2>
        </div>
        <Link
          href="/customer/browse"
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
        >
          Browse more <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {savedArtisans.map(({ artisan }) => (
          <div
            key={artisan.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col justify-between hover:border-slate-200 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  {artisan.user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artisan.user.imageUrl}
                      alt={artisan.user.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{artisan.user.name}</h3>
                    <p className="text-xs text-emerald-600 font-medium">{artisan.category}</p>
                  </div>
                </div>
                <SavedArtisanButton artisanId={artisan.id} isSaved={true} />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  {artisan.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} /> {artisan.location}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                GHS {artisan.pricePerHour}/hr
              </span>
              <Link
                href={`/customer/artisan/${artisan.id}`}
                className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
