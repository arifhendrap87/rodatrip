"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import Link from "next/link"
import { SITE_NAME } from "@/lib/constants"
import type { Itinerary } from "@/types"
import { RoadtripCard } from "@/components/roadtrip/RoadtripCard"

export default function RoadtripListPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [provinceList, setProvinceList] = useState<string[]>([])
  const [cityMap, setCityMap] = useState<Record<string, string[]>>({})
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 12

  const citiesForProvince = selectedProvince !== "all" ? cityMap[selectedProvince] || [] : []

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    setOffset(0)
    setItineraries([])
    setHasMore(true)
    fetchItineraries(0)
  }, [selectedProvince, selectedCity])

  async function fetchFilters() {
    try {
      const res = await fetch("/api/itineraries/available-filters")
      const json = await res.json()
      if (res.ok) {
        setProvinceList(json.data.provinces || [])
        setCityMap(json.data.cities || {})
      }
    } catch {}
  }

  async function fetchItineraries(pageOffset = offset) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedProvince !== "all") params.set("province", selectedProvince)
      if (selectedCity !== "all") params.set("city", selectedCity)
      params.set("limit", String(PAGE_SIZE))
      params.set("offset", String(pageOffset))
      const res = await fetch(`/api/itineraries?${params}`)
      const json = await res.json()
      const data = json.data || []
      setItineraries((prev) => pageOffset === 0 ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
      setOffset(pageOffset)
    } catch {}
    setLoading(false)
  }

  function handleLoadMore() {
    fetchItineraries(offset + PAGE_SIZE)
  }

  const filtered = itineraries.filter((i) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return i.title.toLowerCase().includes(q) || (i as any).roadCondition?.toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85" alt="" className="absolute inset-0 z-0 w-full h-full object-cover" />
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
            <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity("all") }}
              className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 cursor-pointer"
            >
              <option value="all">🏴 Semua Provinsi</option>
              {provinceList.map((p) => {
                const count = itineraries.filter((i: any) => {
                  const stops = (i as any).stops || []
                  return stops.some((s: any) => s.province === p)
                }).length
                return <option key={p} value={p}>{p} ({count})</option>
              })}
            </select>
            {selectedProvince !== "all" && citiesForProvince.length > 0 && (
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 cursor-pointer"
              >
                <option value="all">🏙️ Semua Kota</option>
                {citiesForProvince.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            )}
            {(selectedProvince !== "all" || selectedCity !== "all" || searchQuery) && (
              <button onClick={() => { setSelectedProvince("all"); setSelectedCity("all"); setSearchQuery("") }}
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
          {loading ? (
            <div className="py-20 text-center text-[#6B7280]">Memuat...</div>
          ) : filtered.length === 0 ? (
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
              {filtered.map((itinerary) => (
                <RoadtripCard key={itinerary.id} itinerary={itinerary} />
              ))}
            </div>
          )}
          {!loading && hasMore && filtered.length >= PAGE_SIZE && (
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
