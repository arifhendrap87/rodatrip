"use client"

import { useState } from "react"
import Link from "next/link"
import type { Spot } from "@/types"
import { SPOT_CATEGORIES } from "@/data/spots"

export function SpotCard({ spot }: { spot: any }) {
  const [imgError, setImgError] = useState(false)
  const cat = SPOT_CATEGORIES[spot.category as keyof typeof SPOT_CATEGORIES] || { icon: "📍", label: spot.category }
  const slug = spot.slug
  const imageUrl = spot.image_url || spot.imageUrl
  const addedAt = spot.created_at || spot.addedAt
  const showImage = Boolean(imageUrl) && !imgError

  return (
    <Link href={`/spot-istimewa/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-accent/10">
          {showImage ? (
            <img
              src={imageUrl}
              alt={spot.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-5xl opacity-40">{cat.icon}</span>
            </div>
          )}
          {showImage && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </span>
            {addedAt && isNew(addedAt) && (
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">Baru</span>
            )}
          </div>
          {spot.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
              <span>⭐</span>
              <span>{spot.rating}</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold font-heading leading-tight group-hover:text-primary transition-colors">
            {spot.name}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{spot.description || spot.tips}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>{spot.province}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function isNew(date: string | Date): boolean {
  const d = new Date(date)
  const now = new Date()
  const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays < 30
}
