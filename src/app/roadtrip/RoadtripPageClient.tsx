"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react"
import Link from "next/link"
import { SITE_NAME } from "@/lib/constants"
import type { Itinerary } from "@/types"
import { RoadtripCard } from "@/components/roadtrip/RoadtripCard"

interface RoadtripPageClientProps {
  initialItineraries: Itinerary[]
  initialProvinces: string[]
  initialCities: Record<string, string[]>
}

export default function RoadtripPageClient({ initialItineraries, initialProvinces, initialCities }: RoadtripPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [visibleCount, setVisibleCount] = useState(12)

  const PAGE_SIZE = 12

  const citiesForProvince = selectedProvince !== "all" ? initialCities[selectedProvince] || [] : []

  const filtered = useMemo(() => {
    let result = initialItineraries

    if (selectedProvince !== "all") {
      result = result.filter((i) =>
        i.stops.some((s) => s.province === selectedProvince)
      )
    }
    if (selectedCity !== "all") {
      result = result.filter((i) =>
        i.stops.some((s) => s.province === selectedProvince && (s as any).city === selectedCity)
      )
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        (i.roadCondition?.toLowerCase().includes(q))
      )
    }
    return result
  }, [initialItineraries, selectedProvince, selectedCity, searchQuery])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function handleLoadMore() {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    initialItineraries.forEach((i) => {
      const provinces = [...new Set(i.stops.map((s) => s.province).filter((p): p is string => !!p))]
      provinces.forEach((p) => {
        counts[p] = (counts[p] || 0) + 1
      })
    })
    return counts
  }, [initialItineraries])

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=75" alt="" className="absolute inset-0 z-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/60 to-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90">
              🏎️ Roadtrip Kurasi
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Panduan{" "}
              <span className="text-[#D95D39]">Roadtrip</span>
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-xl">
              Kumpulan rute roadtrip kurasi lengkap dengan itinerary, estimasi biaya, dan tips perjalanan. Siap-siap gas!
            </p>
            <div className="relative max-w-md mt-6">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Cari roadtrip..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D95D39]/50"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E0D8] bg-white/90 backdrop-blur-md shadow-sm sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#6B7280] shrink-0">🌏</span>
            <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity("all"); setVisibleCount(12) }}
              className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 cursor-pointer"
            >
              <option value="all">🏴 Semua Provinsi</option>
              {initialProvinces.map((p) => (
                <option key={p} value={p}>{p} ({provinceCounts[p] || 0})</option>
              ))}
            </select>
            {selectedProvince !== "all" && citiesForProvince.length > 0 && (
              <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setVisibleCount(12) }}
                className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 cursor-pointer"
              >
                <option value="all">🏙️ Semua Kota</option>
                {citiesForProvince.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            )}
            {(selectedProvince !== "all" || selectedCity !== "all" || searchQuery) && (
              <button onClick={() => { setSelectedProvince("all"); setSelectedCity("all"); setSearchQuery(""); setVisibleCount(12) }}
                className="h-9 px-3 rounded-xl border border-[#E5E0D8]/50 text-xs text-[#6B7280] hover:bg-[#F0EDE8] transition-colors"
              >
                ✕ Reset
              </button>
            )}
            <p className="ml-auto text-sm text-[#6B7280] whitespace-nowrap">
              <span className="font-semibold text-[#1E232A]">{filtered.length}</span> roadtrip
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#F0EDE8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {visible.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl">🏎️</span>
              <p className="mt-4 text-lg font-medium text-foreground">
                {searchQuery || selectedProvince !== "all" ? "Tidak ada roadtrip yang cocok" : "Belum ada panduan roadtrip"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((itinerary) => (
                <RoadtripCard key={itinerary.id} itinerary={itinerary} />
              ))}
            </div>
          )}
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
