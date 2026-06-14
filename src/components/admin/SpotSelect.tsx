"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, Search, Plus, ExternalLink } from "lucide-react"
import { QuickSpotModal } from "./QuickSpotModal"
import Link from "next/link"

interface SpotResult {
  slug: string
  name: string
  category: string
  ticket_price: string | null
  facilities: string[] | null
}

interface SpotDetail {
  slug: string
  name: string
  category: string
  province: string
  ticket_price: string | null
  rating: number | null
  opening_hours: string | null
  image_url: string | null
  description: string | null
  tips: string | null
  physical_effort: string | null
  road_access: string | null
  facilities: string[] | null
}

interface SpotSelectProps {
  value: string
  onSelect: (slug: string, name: string) => void
}

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  alam: { emoji: "⛰️", label: "Alam & Petualangan" },
  kuliner: { emoji: "🍜", label: "Kuliner" },
  budaya: { emoji: "🏛️", label: "Sejarah & Budaya" },
  foto: { emoji: "📸", label: "Spot Fotografi" },
  petualangan: { emoji: "🏞️", label: "Petualangan" },
  sejarah: { emoji: "🏛️", label: "Sejarah & Budaya" },
}

export function SpotSelect({ value, onSelect }: SpotSelectProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotResult[]>([])
  const [spotData, setSpotData] = useState<SpotDetail | null>(null)
  const [loadingSpot, setLoadingSpot] = useState(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Fetch spot detail when slug changes
  useEffect(() => {
    if (!value) { setSpotData(null); return }
    setLoadingSpot(true)
    fetch(`/api/spots/${value}`)
      .then((r) => r.json())
      .then((json) => setSpotData(json.data || null))
      .catch(() => setSpotData(null))
      .finally(() => setLoadingSpot(false))
  }, [value])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/spots?search=${encodeURIComponent(query)}&limit=5`)
        const json = await res.json()
        setResults(json.data || [])
        setOpen(true)
      } catch {
        setResults([])
      }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(spot: SpotResult) {
    onSelect(spot.slug, spot.name)
    setQuery("")
    setResults([])
    setOpen(false)
  }

  function handleQuickCreated(slug: string, name: string) {
    onSelect(slug, name)
    setQuickOpen(false)
    setQuery("")
    setResults([])
    setOpen(false)
  }

  const catInfo = spotData?.category ? CATEGORY_LABELS[spotData.category] : null

  return (
    <div ref={ref} className="space-y-1.5 relative">
      <Label className="text-xs">Link ke Spot (opsional)</Label>
      {value ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <Check className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Terhubung ke spot: <strong>{value}</strong></span>
            <button type="button" onClick={() => { onSelect("", ""); setQuery("") }} className="text-xs text-green-500 hover:text-green-700 underline">Ganti</button>
          </div>

          {loadingSpot && <div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><Loader2 className="h-4 w-4 animate-spin" /> Memuat data spot...</div>}

          {spotData && (
            <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
              {spotData.image_url && (
                <div className="aspect-[3/1] bg-muted relative overflow-hidden">
                  <img src={spotData.image_url} alt={spotData.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{spotData.name}</p>
                    {catInfo && <p className="text-xs text-muted-foreground">{catInfo.emoji} {catInfo.label}</p>}
                  </div>
                  {spotData.rating != null && spotData.rating > 0 && (
                    <span className="text-xs flex items-center gap-0.5 text-yellow-600 shrink-0">
                      <span>⭐</span> {spotData.rating}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {spotData.ticket_price && <span>🎟️ {spotData.ticket_price}</span>}
                  {spotData.province && <span>📍 {spotData.province}</span>}
                  {spotData.opening_hours && <span>🕐 {spotData.opening_hours}</span>}
                  {spotData.physical_effort && <span>🏃 {spotData.physical_effort}</span>}
                  {spotData.road_access && <span>🚗 {spotData.road_access}</span>}
                </div>

                {spotData.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{spotData.description}</p>
                )}

                {spotData.facilities && spotData.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {spotData.facilities.map((f) => (
                      <span key={f} className="inline-flex rounded-md border border-border/20 bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground">{f}</span>
                    ))}
                  </div>
                )}

                {spotData.tips && (
                  <p className="text-xs text-amber-600/70">💡 {spotData.tips}</p>
                )}

                <Link href={`/admin/spots/${value}/edit`} target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors pt-1">
                  <ExternalLink className="h-3 w-3" /> Edit Spot di Halaman Spots
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari destinasi wisata..."
              className="pl-8"
            />
            {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <button type="button" onClick={() => setQuickOpen(true)}
            className="w-full flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-sm font-medium px-4 py-3 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Buat Spot Baru</span>
            <span className="text-xs text-muted-foreground font-normal">Buat destinasi baru dan langsung link ke stop ini</span>
          </button>
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/50 bg-white shadow-lg overflow-hidden">
          {results.length > 0 && results.map((spot) => (
            <button key={spot.slug} type="button" onClick={() => handleSelect(spot)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0">
              <p className="text-sm font-medium">{spot.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{spot.category} {spot.ticket_price ? `· ${spot.ticket_price}` : ""}</p>
            </button>
          ))}

          {query.length >= 2 && (
            <button type="button" onClick={() => setQuickOpen(true)}
              className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-t border-border/20 flex items-center gap-3 text-primary">
              <Plus className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Buat Spot Baru "{query}"</p>
                <p className="text-xs text-muted-foreground">Buat destinasi baru dan langsung link ke stop ini</p>
              </div>
            </button>
          )}

          {results.length === 0 && query.length >= 2 && (
            <p className="px-4 py-3 text-sm text-muted-foreground text-center">Tidak ditemukan spot dengan nama "{query}"</p>
          )}
        </div>
      )}

      <QuickSpotModal open={quickOpen} defaultName={query} onClose={() => setQuickOpen(false)} onCreated={handleQuickCreated} />
    </div>
  )
}
