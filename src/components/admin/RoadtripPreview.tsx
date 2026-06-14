"use client"

import { parseEmbedUrl } from "@/lib/embed"

interface StopPreview {
  stopNumber: number
  name: string
  visitDuration?: string
  bestVisitHour?: string
  additionalCost?: string
  spotImportantNote?: string
}

interface RoadtripPreviewProps {
  title: string
  itineraryDuration?: string
  totalDistance?: string
  roadCondition?: string
  estimatedCost?: string
  bestDrivingTime?: string
  routeFacilities?: string[]
  mapsEmbedUrl?: string
  drivingSafetyTips?: string
  culinaryNotes?: string
  stops: StopPreview[]
}

export function RoadtripPreview({ title, itineraryDuration, totalDistance, roadCondition, estimatedCost, bestDrivingTime, routeFacilities, mapsEmbedUrl, drivingSafetyTips, culinaryNotes, stops }: RoadtripPreviewProps) {
  const hasData = title || itineraryDuration || totalDistance || stops.some((s) => s.name)
  if (!hasData) return <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 p-12 text-center"><p className="text-sm text-muted-foreground">Preview akan muncul setelah data diisi</p></div>

  const filteredStops = stops.filter((s) => s.name.trim())

  return (
    <div className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/[0.08] via-accent/[0.03] to-background p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🏎️</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview Roadtrip</span>
        </div>
        <h3 className="text-xl font-bold font-heading leading-tight">{title || "Road Trip"}</h3>
        <p className="text-sm text-muted-foreground mt-1">{[itineraryDuration, totalDistance, estimatedCost].filter(Boolean).join(" · ") || "Isi data makro terlebih dahulu"}</p>
      </div>

      <div className="p-6 space-y-5">
        {roadCondition && <div className="flex items-start gap-3"><span className="text-lg shrink-0">🛣️</span><div><p className="text-xs font-semibold font-heading text-muted-foreground uppercase">Kondisi Jalan</p><p className="text-sm mt-0.5">{roadCondition}</p></div></div>}
        {bestDrivingTime && <div className="flex items-start gap-3"><span className="text-lg shrink-0">🌅</span><div><p className="text-xs font-semibold font-heading text-muted-foreground uppercase">Waktu Terbaik</p><p className="text-sm mt-0.5">{bestDrivingTime}</p></div></div>}
        {routeFacilities && routeFacilities.length > 0 && <div><p className="text-xs font-semibold font-heading text-muted-foreground uppercase mb-2">Fasilitas Jalur</p><div className="flex flex-wrap gap-1.5">{routeFacilities.map((f) => <span key={f} className="inline-flex rounded-md border border-border/30 bg-muted/30 px-2.5 py-1 text-xs font-medium">{f}</span>)}</div></div>}
        {(() => { const p = parseEmbedUrl(mapsEmbedUrl || ""); if (!p) return null; return (<div className="rounded-xl overflow-hidden border border-border/50">{p.type === "embed" ? <iframe src={p.url} width="100%" height="250" style={{ border: 0 }} loading="lazy" /> : <a href={p.url} target="_blank" className="flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary font-medium py-8 px-4 transition-colors"><span className="text-lg">📍</span> Buka Rute di Google Maps</a>}</div>) })()}

        {filteredStops.length > 0 && (
          <div>
            <p className="text-xs font-semibold font-heading text-muted-foreground uppercase mb-3">Destinasi ({filteredStops.length})</p>
            <div className="space-y-3">
              {filteredStops.map((stop, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{stop.stopNumber}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{stop.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      {stop.visitDuration && <span>⏱️ {stop.visitDuration}</span>}
                      {stop.bestVisitHour && <span>🕐 {stop.bestVisitHour}</span>}
                      {stop.additionalCost && <span>💰 {stop.additionalCost.slice(0, 30)}</span>}
                    </div>
                    {stop.spotImportantNote && <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{stop.spotImportantNote}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!roadCondition && !bestDrivingTime && filteredStops.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Preview akan update secara real-time saat Anda mengetik</p>}
      </div>

      {(drivingSafetyTips || culinaryNotes) && (
        <div className="border-t border-border/30 p-6 space-y-4">
          {drivingSafetyTips && <div className="flex items-start gap-3"><span className="text-lg shrink-0">⚠️</span><div><p className="text-xs font-semibold font-heading text-muted-foreground uppercase">Tips Keselamatan</p><p className="text-sm mt-0.5">{drivingSafetyTips}</p></div></div>}
          {culinaryNotes && <div className="flex items-start gap-3"><span className="text-lg shrink-0">🍜</span><div><p className="text-xs font-semibold font-heading text-muted-foreground uppercase">Kuliner</p><p className="text-sm mt-0.5">{culinaryNotes}</p></div></div>}
        </div>
      )}
    </div>
  )
}
