"use client"

import { useState } from "react"
import Link from "next/link"
import type { ItineraryStop } from "@/types"
import { NearbyPlaces } from "@/components/roadtrip/NearbyPlaces"
import { SPOT_CATEGORY_DISPLAY } from "@/lib/constants"
import { Copy } from "lucide-react"
import { toast } from "sonner"

function fixMapsUrl(url?: string): string {
  if (!url || !url.includes("maps/")) return url || ""
  const origin = url.match(/[?&]origin=([^&]+)/)?.[1]
  const dest = url.match(/[?&]destination=([^&]+)/)?.[1]
  if (origin && dest) return `https://www.google.com/maps/dir/${origin}/${dest}`
  if (dest) return `https://www.google.com/maps/dir//${dest}`
  return url
}

interface ItineraryTimelineProps {
  stops: ItineraryStop[]
}

export function ItineraryTimeline({ stops }: ItineraryTimelineProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  function toggleStop(num: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  if (stops.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Belum ada destinasi dalam roadtrip ini.
      </div>
    )
  }

  return (
    <div className="relative">
      {stops.map((stop, index) => {
        const isOpen = expanded.has(stop.stopNumber)
        return (
        <div key={stop.id || stop.stopNumber} className="relative pb-12 last:pb-0">
          {index < stops.length - 1 && (
            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-primary/5" />
          )}

          <div className="flex gap-6">
            <div className="relative flex shrink-0 flex-col items-center">
              <button onClick={() => toggleStop(stop.stopNumber)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
                {stop.stopNumber}
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <button onClick={() => toggleStop(stop.stopNumber)}
                className="w-full flex items-center gap-2 text-left mb-1 hover:bg-muted/30 rounded-lg px-2 -mx-2 py-1 transition-colors">
                <h3 className="text-xl font-bold font-heading flex-1">{stop.name}</h3>
                <span className={`text-primary text-lg font-bold transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}>
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {stop.category && (() => {
                  const display = SPOT_CATEGORY_DISPLAY[stop.category]
                  return (
                    <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3 py-0.5 text-xs font-medium">
                      {display ? `${display.emoji} ${display.label}` : stop.category}
                    </span>
                  )
                })()}
                {stop.province && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/30 bg-background px-3 py-0.5 text-xs text-muted-foreground">
                    📍 {stop.province}
                  </span>
                )}
                {stop.rating && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">⭐ {stop.rating}/5</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {stop.visitDuration && (
                  <span className="inline-flex items-center gap-1">
                    <span>⏱️</span> Estimasi: {stop.visitDuration}
                  </span>
                )}
                {stop.bestVisitHour && (
                  <span className="inline-flex items-center gap-1">
                    <span>🕐</span> Waktu Terbaik: {stop.bestVisitHour}
                  </span>
                )}
                {stop.openingHours && (
                  <span className="inline-flex items-center gap-1">
                    <span>🚪</span> Buka: {stop.openingHours}
                  </span>
                )}
              </div>

              {stop.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border/30 bg-muted">
                  <img src={stop.imageUrl} alt={stop.name} className="w-full aspect-[16/7] object-cover" loading="lazy" />
                </div>
              )}

              {!isOpen && (
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium cursor-pointer hover:underline"
                    onClick={() => toggleStop(stop.stopNumber)}>
                    ▶ Lihat detail destinasi ini
                  </span>
                </div>
              )}

              {isOpen && (
                <div className="space-y-4 mt-4">

              {stop.description && (
                <div className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: stop.description }} />
              )}

              {(stop.ticketPrice || stop.parkingFee || stop.additionalCost) && (
                <div className="rounded-xl border border-border/40 bg-white/60 p-4 space-y-2">
                  <p className="text-xs font-semibold font-heading text-muted-foreground uppercase tracking-wider">
                    Info Tiket & Biaya
                  </p>
                  {stop.ticketPrice && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-24 shrink-0">Tiket Masuk:</span>
                      <span className="font-medium">{stop.ticketPrice}</span>
                    </div>
                  )}
                  {stop.parkingFee && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-24 shrink-0">Parkir:</span>
                      <span className="font-medium">{stop.parkingFee}</span>
                    </div>
                  )}
                  {stop.additionalCost && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-24 shrink-0">Tambahan:</span>
                      <span className="font-medium">{stop.additionalCost}</span>
                    </div>
                  )}
                </div>
              )}

              {stop.roadAccess && (
                <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-white/60 p-4">
                  <span className="text-lg shrink-0">🚗</span>
                  <div>
                    <p className="text-xs font-semibold font-heading text-muted-foreground uppercase tracking-wider">Akses Jalan</p>
                    <p className="text-sm mt-1">{stop.roadAccess}</p>
                  </div>
                </div>
              )}

              {stop.physicalEffort && (
                <div className="rounded-xl border border-border/40 bg-white/60 p-4">
                  <p className="text-xs font-semibold font-heading text-muted-foreground uppercase tracking-wider">
                    Kondisi Fisik & Medan
                  </p>
                  <p className="mt-1 text-sm">🏃 {stop.physicalEffort}</p>
                </div>
              )}

              {stop.facilities && stop.facilities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold font-heading text-muted-foreground uppercase tracking-wider mb-2">
                    Fasilitas di Lokasi
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stop.facilities.map((f) => (
                      <span key={f} className="inline-flex items-center rounded-md border border-border/30 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {stop.images && stop.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {stop.images.slice(0, 5).map((img, i) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border border-border/30 bg-muted hover:opacity-90 transition-opacity ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                      <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" loading="lazy" />
                      {i === 4 && stop.images && stop.images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{stop.images.length - 5}</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}

              {stop.spotImportantNote && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">⚠️</span>
                    <div>
                      <p className="text-xs font-semibold text-red-600">Catatan Penting Pengendara</p>
                      <p className="mt-1 text-sm text-red-500 leading-relaxed">{stop.spotImportantNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {stop.tips && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">💡</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Tips</p>
                      <p className="mt-0.5 text-sm text-amber-600">{stop.tips}</p>
                    </div>
                  </div>
                </div>
              )}

              {stop.spotSlug && (
                <Link
                  href={`/spot-istimewa/${stop.spotSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Baca ulasan lengkap tempat ini
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              )}

              {stop.lat && stop.lng && (
                <div className="border-t border-border/20 pt-4 mt-4">
                  <NearbyPlaces
                    lat={stop.lat}
                    lng={stop.lng}
                    category="all"
                    radius={3000}
                    limit={4}
                  />
                </div>
              )}
              </div>
              )}
            </div>
          </div>

          {index < stops.length - 1 && (
            <div className="ml-6 mt-4 pl-[4.5rem]">
              <div className="h-px bg-gradient-to-r from-border/50 to-transparent" />
            </div>
          )}
        </div>
        )
      })}
    </div>
  )
}
