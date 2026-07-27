"use client"

import Link from "next/link"
import { SpotCard } from "@/components/spot/SpotCard"

interface FeaturedSpotsProps {
  spots: any[]
}

export function FeaturedSpots({ spots }: FeaturedSpotsProps) {
  if (spots.length === 0) return null

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#F0EDE8]">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
            ✨ Tempat Istimewa
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Spot Pilihan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Hidden gems, panorama ikonik, dan tempat seru di sepanjang rute roadtrip kamu.
          </p>
        </div>

        <div className="mt-12 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {spots.map((spot) => (
            <SpotCard key={spot.slug} spot={spot} />
          ))}
        </div>

        {spots.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/spot-istimewa"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
            >
              Lihat Semua Spot
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
