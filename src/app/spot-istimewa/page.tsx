"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { SpotCard } from "@/components/spot/SpotCard"
import { SPOT_CATEGORIES } from "@/data/spots"
import { heroStagger, heroItem } from "@/lib/animations"
import { BlobBackground } from "@/components/shared/BlobBackground"
import { api } from "@/lib/api/client"
import type { SpotCategory } from "@/types"

const REGIONS = [
  { key: "all", label: "Semua Region", icon: "🌏" },
  { key: "Jawa", label: "Jawa", icon: "🏔️", desc: "Pulau terpadat dengan segudang destinasi" },
  { key: "Bali & Nusa Tenggara", label: "Bali & NT", icon: "🌴", desc: "Surga tropis dengan pantai eksotis" },
  { key: "Sumatera", label: "Sumatera", icon: "🏝️", desc: "Alam liar dan budaya yang kaya" },
  { key: "Sulawesi", label: "Sulawesi", icon: "🦀", desc: "Eksotis dan penuh kejutan" },
  { key: "Kalimantan", label: "Kalimantan", icon: "🌲", desc: "Hutan hujan tropis yang memukau" },
]

const ALL_CATEGORIES: { key: SpotCategory | "all"; label: string; icon: string }[] = [
  { key: "all", label: "Semua", icon: "🔍" },
  ...Object.entries(SPOT_CATEGORIES).map(([key, val]) => ({
    key: key as SpotCategory,
    label: val.label,
    icon: val.icon,
  })),
]

interface SpotData {
  slug: string
  name: string
  category: SpotCategory
  province: string
  city?: string
  region: string
  description: string
  rating: number
  image_url: string
  tags: string[]
}

export default function SpotIstimewaPage() {
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | "all">("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [spots, setSpots] = useState<SpotData[]>([])
  const [loading, setLoading] = useState(true)

  const PROVINSI = [...new Set(spots.map((s) => s.province))].sort()

  const citiesForProvince = selectedProvince !== "all"
    ? [...new Set(spots.filter((s) => s.province === selectedProvince && s.city).map((s) => s.city as string))].sort()
    : []

  useEffect(() => {
    const params: Record<string, string> = {}
    if (selectedCategory !== "all") params.category = selectedCategory
    if (selectedRegion !== "all") params.region = selectedRegion
    if (selectedProvince !== "all") params.province = selectedProvince
    if (selectedCity !== "all") params.city = selectedCity
    if (searchQuery) params.search = searchQuery
    params.limit = "100"

    api.spots.list(params)
      .then((res: any) => setSpots(res?.data || []))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false))
  }, [selectedCategory, selectedRegion, selectedProvince, selectedCity])

  const filtered = spots.filter((spot) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return spot.name.toLowerCase().includes(q) || spot.description.toLowerCase().includes(q) || spot.province.toLowerCase().includes(q) || spot.tags?.some((t) => t.includes(q))
    }
    return true
  })

  const regionCounts: Record<string, number> = {}
  spots.forEach((s) => { regionCounts[s.region] = (regionCounts[s.region] || 0) + 1 })

  return (
    <>
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#FDFBF7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 w-full">
          <motion.div variants={heroStagger} initial="initial" animate="animate" className="max-w-3xl">
            <motion.div variants={heroItem}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2C4A3E]/20 bg-[#2C4A3E]/5 px-4 py-1.5 text-sm text-[#2C4A3E]">✨ Tempat Istimewa</span>
            </motion.div>
            <motion.h1 variants={heroItem}
              className="mt-6 text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#1E232A" }}
            >
              Spot <span className="text-[#D95D39]">Istimewa</span>
            </motion.h1>
            <motion.p variants={heroItem} className="mt-4 text-lg text-[#6B7280] max-w-xl">
              Kumpulan tempat-tempat epik di Indonesia yang bikin roadtrip kamu nggak terlupakan. Dikurasi khusus buat kamu.
            </motion.p>
            <motion.div variants={heroItem}>
              <div className="relative max-w-md mt-8">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Cari spot, provinsi, atau tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#E5E0D8] bg-white text-[#1E232A] placeholder:text-[#9CA3AF] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 bg-[#FDFBF7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-sm font-semibold font-heading text-[#6B7280] uppercase tracking-wider mb-4">Jelajah Berdasarkan Region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {REGIONS.filter((r) => r.key !== "all").map((region) => (
              <button key={region.key} onClick={() => setSelectedRegion(selectedRegion === region.key ? "all" : region.key)}
                className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 card-glow ${selectedRegion === region.key ? "border-[#D95D39] bg-[#D95D39]/5 shadow-md shadow-[#D95D39]/10" : "bg-white hover:border-[#D95D39]/30"}`}
              >
                <span className="text-2xl">{region.icon}</span>
                <p className={`mt-2 text-sm font-semibold font-heading ${selectedRegion === region.key ? "text-[#D95D39]" : "text-[#1E232A]"}`}>{region.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{region.desc}</p>
                <p className="text-[10px] text-[#6B7280] mt-1 font-mono">{regionCounts[region.key]} spot</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-[#E5E0D8] bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button key={cat.key} onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${selectedCategory === cat.key ? "bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/25" : "bg-[#F0EDE8] text-[#6B7280] hover:bg-[#E5E0D8] hover:text-[#1E232A]"}`}
              >
                <span>{cat.icon}</span><span>{cat.label}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[#6B7280] hidden sm:inline">🌏</span>
              <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity("all") }}
                className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 cursor-pointer"
              >
                <option value="all">🏴 Semua Provinsi</option>
                {PROVINSI.map((p) => {
                  const count = spots.filter((s) => s.province === p).length
                  return <option key={p} value={p}>{p} ({count})</option>
                })}
              </select>
              {selectedProvince !== "all" && citiesForProvince.length > 0 && (
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 cursor-pointer"
                >
                  <option value="all">🏙️ Semua Kota</option>
                  {citiesForProvince.map((c) => {
                    const count = spots.filter((s) => s.province === selectedProvince && s.city === c).length
                    return <option key={c} value={c}>{c} ({count})</option>
                  })}
                </select>
              )}
              {(selectedProvince !== "all" || selectedCity !== "all" || selectedCategory !== "all" || selectedRegion !== "all" || searchQuery) && (
                <button onClick={() => { setSelectedCategory("all"); setSelectedRegion("all"); setSelectedProvince("all"); setSelectedCity("all"); setSearchQuery("") }}
                  className="h-9 px-3 rounded-xl border border-[#E5E0D8]/50 text-xs text-[#6B7280] hover:bg-[#F0EDE8] transition-colors whitespace-nowrap"
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#F0EDE8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#1E232A]">{loading ? "..." : filtered.length}</span> spot ditemukan
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#6B7280]">Memuat spot...</div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((spot, i) => (
                <motion.div key={spot.slug} className="card-glow rounded-xl overflow-hidden bg-white" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}>
                  <SpotCard spot={spot} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-4xl">🔍</span>
              <p className="mt-4 text-lg font-medium text-[#1E232A]">Tidak ada spot yang cocok</p>
              <p className="mt-1 text-sm text-[#6B7280]">Coba ubah filter atau kata kunci pencarian</p>
              <button onClick={() => { setSelectedCategory("all"); setSelectedRegion("all"); setSelectedProvince("all"); setSelectedCity("all"); setSearchQuery("") }}
                className="mt-4 text-sm text-[#D95D39] hover:underline underline-offset-2">Reset Filter</button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
