"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { RoadtripCard } from "@/components/roadtrip/RoadtripCard"
import type { Itinerary } from "@/types"

export function FeaturedRoadtrips() {
  const [roadtrips, setRoadtrips] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/itineraries?limit=6")
      .then((r) => r.json())
      .then((json) => setRoadtrips(json.data || []))
      .catch(() => setRoadtrips([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#FDFBF7]">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.02] via-transparent to-secondary/[0.02]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
            🏎️ Roadtrip Kurasi
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Rute Roadtrip Pilihan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Itinerary siap pakai dengan timeline, estimasi biaya, dan spot-spot menarik di sepanjang jalan.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[2rem] border border-border/50 bg-white overflow-hidden"
              >
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 rounded-full bg-muted" />
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              </div>
            ))
          ) : roadtrips.length === 0 ? null : (
            roadtrips.map((itinerary) => (
              <RoadtripCard key={itinerary.id} itinerary={itinerary} />
            ))
          )}
        </div>

        {!loading && roadtrips.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/roadtrip"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Lihat Semua Roadtrip
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
