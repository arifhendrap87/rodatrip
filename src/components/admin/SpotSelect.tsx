"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, Search, Plus } from "lucide-react"
import { QuickSpotModal } from "./QuickSpotModal"

interface SpotResult {
  slug: string
  name: string
  category: string
  ticket_price: string | null
  facilities: string[] | null
}

interface SpotSelectProps {
  value: string
  onSelect: (slug: string, name: string) => void
}

export function SpotSelect({ value, onSelect }: SpotSelectProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotResult[]>([])
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

  return (
    <div ref={ref} className="space-y-1.5 relative">
      <Label className="text-xs">Link ke Spot (opsional)</Label>
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <Check className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">Terhubung ke spot: <strong>{value}</strong></span>
          <button
            type="button"
            onClick={() => { onSelect("", ""); setQuery("") }}
            className="text-xs text-green-500 hover:text-green-700 underline"
          >
            Ganti
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari destinasi wisata..."
            className="pl-8"
          />
          {loading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/50 bg-white shadow-lg overflow-hidden">
          {results.length > 0 && results.map((spot) => (
            <button
              key={spot.slug}
              type="button"
              onClick={() => handleSelect(spot)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0"
            >
              <p className="text-sm font-medium">{spot.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {spot.category} {spot.ticket_price ? `· ${spot.ticket_price}` : ""}
              </p>
            </button>
          ))}

          {query.length >= 2 && (
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-t border-border/20 flex items-center gap-3 text-primary"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Buat Spot Baru "{query}"</p>
                <p className="text-xs text-muted-foreground">Buat destinasi baru dan langsung link ke stop ini</p>
              </div>
            </button>
          )}

          {results.length === 0 && query.length >= 2 && (
            <p className="px-4 py-3 text-sm text-muted-foreground text-center">
              Tidak ditemukan spot dengan nama "{query}"
            </p>
          )}
        </div>
      )}

      <QuickSpotModal
        open={quickOpen}
        defaultName={query}
        onClose={() => setQuickOpen(false)}
        onCreated={handleQuickCreated}
      />
    </div>
  )
}
