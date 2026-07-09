"use client"

import { useState } from "react"
import Link from "next/link"
import type { Itinerary } from "@/types"

interface RoadtripCardProps {
  itinerary: Itinerary
}

export function RoadtripCard({ itinerary }: RoadtripCardProps) {
  const [imgError, setImgError] = useState(false)
  const hasImage = itinerary.coverImage && !imgError

  return (
    <Link
      href={`/roadtrip/${itinerary.slug}`}
      className="group block card-glow rounded-[2rem] bg-white overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className={`relative aspect-[16/9] overflow-hidden ${hasImage ? "" : "bg-gradient-to-br from-primary/10 to-accent/10"}`}>
        {hasImage ? (
          <img
            src={itinerary.coverImage}
            alt={itinerary.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl opacity-40">🏎️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">
            {itinerary.itineraryDuration || "Roadtrip"}
          </span>
          {itinerary.totalDistance && (
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">
              {itinerary.totalDistance}
            </span>
          )}
        </div>
      </div>
      <div className="p-5 pt-4">
        <h3 className="text-lg font-bold font-heading leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {itinerary.title}
        </h3>
        {itinerary.roadCondition && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            🛣️ {itinerary.roadCondition}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span>📍</span>
            <span>{itinerary.stops.length} destinasi</span>
          </span>
          {itinerary.estimatedCost && (
            <span className="inline-flex items-center gap-1">
              <span>💰</span>
              <span className="truncate max-w-[140px]">{itinerary.estimatedCost}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
