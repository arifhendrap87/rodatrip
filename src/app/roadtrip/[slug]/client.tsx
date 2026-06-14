"use client"

import { useState } from "react"
import Link from "next/link"
import type { Itinerary } from "@/types"
import { ItineraryTimeline } from "./ItineraryTimeline"
import { parseEmbedUrl } from "@/lib/embed"

interface RoadtripDetailClientProps {
  itinerary: Itinerary
}

export function RoadtripDetailClient({ itinerary }: RoadtripDetailClientProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: itinerary.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-20 sm:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/roadtrip"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Semua Roadtrip
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight leading-tight">
            {itinerary.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {itinerary.itineraryDuration && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {itinerary.itineraryDuration}
              </span>
            )}
            {itinerary.totalDistance && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {itinerary.totalDistance}
              </span>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />
              </svg>
              {copied ? "Link disalin!" : "Bagikan"}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {itinerary.roadCondition && (
          <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-muted/30 p-5">
            <span className="text-2xl shrink-0">🛣️</span>
            <div>
              <p className="text-sm font-semibold font-heading">Kondisi Jalan</p>
              <p className="text-sm text-muted-foreground mt-1">{itinerary.roadCondition}</p>
            </div>
          </div>
        )}

        {itinerary.estimatedCost && (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <span className="text-2xl shrink-0">💰</span>
            <div>
              <p className="text-sm font-semibold font-heading">Estimasi Biaya</p>
              <p className="text-sm text-muted-foreground mt-1">{itinerary.estimatedCost}</p>
            </div>
          </div>
        )}

        {itinerary.bestDrivingTime && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <span className="text-2xl shrink-0">🌅</span>
            <div>
              <p className="text-sm font-semibold font-heading">Waktu Terbaik Berkendara</p>
              <p className="text-sm text-muted-foreground mt-1">{itinerary.bestDrivingTime}</p>
            </div>
          </div>
        )}

        {itinerary.routeFacilities && itinerary.routeFacilities.length > 0 && (
          <div>
            <h2 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
              <span>⛽</span> Fasilitas Sepanjang Jalur
            </h2>
            <div className="flex flex-wrap gap-2">
              {itinerary.routeFacilities.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-white px-3.5 py-1.5 text-sm font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {(() => {
          const parsed = parseEmbedUrl(itinerary.mapsEmbedUrl || "")
          if (!parsed) return null
          return (
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm">
              {parsed.type === "embed" ? (
                <iframe src={parsed.url} width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              ) : (
                <a href={parsed.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary font-medium py-10 px-4 transition-colors rounded-2xl">
                  <span className="text-2xl">📍</span>
                  <span className="text-base font-semibold">Buka Rute di Google Maps</span>
                </a>
              )}
            </div>
          )
        })()}

        <div>
          <h2 className="text-2xl font-bold font-heading mb-8 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">🏎️</span>
            Urutan Destinasi (Timeline Itinerary)
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Berikut adalah panduan urutan rute perjalanan dari titik singgah pertama hingga akhir agar perjalanan road trip Anda searah dan efisien.
          </p>

          <ItineraryTimeline stops={itinerary.stops} />
        </div>

        {itinerary.drivingSafetyTips && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="text-lg font-bold font-heading flex items-center gap-2 text-red-700">
              <span>⚠️</span> Tips Keselamatan Berkendara
            </h3>
            <p className="mt-3 text-sm text-red-600 leading-relaxed">{itinerary.drivingSafetyTips}</p>
          </div>
        )}

        {itinerary.culinaryNotes && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h3 className="text-lg font-bold font-heading flex items-center gap-2 text-orange-700">
              <span>🍜</span> Catatan Kuliner
            </h3>
            <p className="mt-3 text-sm text-orange-600 leading-relaxed">{itinerary.culinaryNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
