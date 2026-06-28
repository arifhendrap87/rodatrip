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
      <section className="relative min-h-[60vh] flex items-center overflow-hidden hero-gradient">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32 w-full">
          <motion.div variants={heroStagger} initial="initial" animate="animate" className="max-w-3xl">
            <motion.div variants={heroItem}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm text-white/90 shadow-lg">✨ Tempat Istimewa</span>
            </motion.div>
            <motion.h1 variants={heroItem}
              className="mt-6 text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl font-heading glow-text"
              style={{ fontFamily: "var(--font-display)", color: "white" }}
            >
              Spot <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">Istimewa</span>
            </motion.h1>
            <motion.p variants={heroItem} className="mt-4 text-lg text-white/70 max-w-xl">
              Kumpulan tempat-tempat epik di Indonesia yang bikin roadtrip kamu nggak terlupakan. Dikurasi khusus buat kamu.
            </motion.p>
            <motion.div variants={heroItem}>
              <div className="relative max-w-md mt-8">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Cari spot, provinsi, atau tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl glass-dark text-white placeholder:text-white/50 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 section-light-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-sm font-semibold font-heading text-muted-foreground uppercase tracking-wider mb-4">Jelajah Berdasarkan Region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {REGIONS.filter((r) => r.key !== "all").map((region) => (
              <button key={region.key} onClick={() => setSelectedRegion(selectedRegion === region.key ? "all" : region.key)}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 card-glow ${selectedRegion === region.key ? "border-primary bg-primary/10 shadow-md shadow-primary/10" : "border-border/50 bg-white hover:border-primary/30"}`}
              >
                <span className="text-2xl">{region.icon}</span>
                <p className={`mt-2 text-sm font-semibold font-heading ${selectedRegion === region.key ? "text-primary" : "text-foreground"}`}>{region.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{region.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{regionCounts[region.key]} spot</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-border/30 glass shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button key={cat.key} onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${selectedCategory === cat.key ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <span>{cat.icon}</span><span>{cat.label}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">🌏</span>
              <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity("all") }}
                className="h-9 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">🏴 Semua Provinsi</option>
                {PROVINSI.map((p) => {
                  const count = spots.filter((s) => s.province === p).length
                  return <option key={p} value={p}>{p} ({count})</option>
                })}
              </select>
              {selectedProvince !== "all" && citiesForProvince.length > 0 && (
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
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
                  className="h-9 px-3 rounded-xl border border-border/50 text-xs text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap"
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 section-light-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{loading ? "..." : filtered.length}</span> spot ditemukan
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Memuat spot...</div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((spot, i) => (
                <motion.div key={spot.slug} className="card-glow rounded-2xl overflow-hidden bg-white" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}>
                  <SpotCard spot={spot} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-4xl">🔍</span>
              <p className="mt-4 text-lg font-medium text-foreground">Tidak ada spot yang cocok</p>
              <p className="mt-1 text-sm text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
              <button onClick={() => { setSelectedCategory("all"); setSelectedRegion("all"); setSelectedProvince("all"); setSelectedCity("all"); setSearchQuery("") }}
                className="mt-4 text-sm text-primary hover:underline underline-offset-2">Reset Filter</button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
