import Link from "next/link"
import { Bookmark, Star, MapPin, User, ArrowRight } from "lucide-react"
import SavedArtisanButton from "./_saved-artisan-button"
import { getArtisanPhoto } from "@/lib/artisan-categories"

interface SavedItem {
  id: string
  artisanId: string
  artisan: {
    id: string
    userId: string
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
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Bookmark size={14} className="fill-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-950">Saved Artisans ({savedArtisans.length})</h2>
        </div>
        <Link
          href="/customer/browse"
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950"
        >
          Browse more <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {savedArtisans.map(({ artisan }) => {
          const artisanPhoto = getArtisanPhoto(artisan.user.name, artisan.category)

          return (
            <div
              key={artisan.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {artisanPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={artisanPhoto}
                        alt={`${artisan.category} artisan ${artisan.user.name}`}
                        className="h-10 w-10 shrink-0 rounded-xl border border-slate-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-emerald-600">
                        <User size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-950">{artisan.user.name}</h3>
                      <p className="truncate text-xs font-medium text-slate-500">{artisan.category}</p>
                    </div>
                  </div>
                  <SavedArtisanButton artisanId={artisan.id} isSaved={true} />
                </div>

              <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {artisan.rating.toFixed(1)}
                </span>
                <span>-</span>
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <MapPin size={11} /> {artisan.location}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-950">
                GHS {artisan.pricePerHour}/hr
              </span>
              <Link
                href={`/customer/artisan/${artisan.userId}`}
                className="inline-flex min-h-8 items-center rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Book
              </Link>
            </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
