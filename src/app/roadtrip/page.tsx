"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { SITE_NAME } from "@/lib/constants"
import type { Itinerary } from "@/types"

export default function RoadtripListPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [provinceList, setProvinceList] = useState<string[]>([])
  const [cityMap, setCityMap] = useState<Record<string, string[]>>({})
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")

  const citiesForProvince = selectedProvince !== "all" ? cityMap[selectedProvince] || [] : []

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchItineraries()
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

  async function fetchItineraries() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedProvince !== "all") params.set("province", selectedProvince)
      if (selectedCity !== "all") params.set("city", selectedCity)
      const res = await fetch(`/api/itineraries?${params}`)
      const json = await res.json()
      setItineraries(json.data || [])
    } catch {}
    setLoading(false)
  }

  const filtered = itineraries.filter((i) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return i.title.toLowerCase().includes(q) || (i as any).roadCondition?.toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=85" alt="" className="absolute inset-0 z-0 w-full h-full object-cover" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/50" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90">
              🏎️ Roadtrip Kurasi
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Panduan{" "}
              <span className="text-[#D95D39]">Roadtrip</span>
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-xl">
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
                <Link key={itinerary.id} href={`/roadtrip/${itinerary.slug}`} className="group block card-glow rounded-[2rem] bg-white overflow-hidden border border-border/50">
                  {itinerary.coverImage ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image src={itinerary.coverImage} alt={itinerary.title} fill unoptimized
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">{itinerary.itineraryDuration || "Roadtrip"}</span>
                        {itinerary.totalDistance && <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">{itinerary.totalDistance}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <Image src="/images/roadtrip-default.svg" alt="Roadtrip default" fill unoptimized className="object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">{itinerary.itineraryDuration || "Roadtrip"}</span>
                        {itinerary.totalDistance && <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">{itinerary.totalDistance}</span>}
                      </div>
                    </div>
                  )}
                  <div className="p-6 pt-4">
                    <h3 className="text-lg font-bold font-heading leading-tight group-hover:text-primary transition-colors line-clamp-2">{itinerary.title}</h3>
                    {(itinerary as any).roadCondition && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">🛣️ {(itinerary as any).roadCondition}</p>}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><span>📍</span><span>{itinerary.stops.length} destinasi</span></span>
                      {itinerary.estimatedCost && <span className="inline-flex items-center gap-1"><span>💰</span><span className="truncate max-w-[140px]">{itinerary.estimatedCost}</span></span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
