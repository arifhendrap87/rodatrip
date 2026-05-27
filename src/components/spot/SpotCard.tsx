import Link from "next/link"
import Image from "next/image"
import type { Spot } from "@/types"
import { SPOT_CATEGORIES } from "@/data/spots"

export function SpotCard({ spot }: { spot: Spot }) {
  const cat = SPOT_CATEGORIES[spot.category]
  const slug = spot.slug

  return (
    <Link href={`/spot-istimewa/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={spot.imageUrl}
            alt={spot.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </span>
            {isNew(spot.addedAt) && (
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                Baru
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
              <span className="text-yellow-500">★</span>
              <span>{spot.rating}</span>
            </span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-1">{spot.province}</p>
          <h3 className="text-lg font-bold font-heading group-hover:text-primary transition-colors">{spot.name}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {spot.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {spot.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

function isNew(date: Date) {
  const diff = Date.now() - date.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  return days < 30
}
