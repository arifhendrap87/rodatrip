"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { SpotCard } from "@/components/spot/SpotCard"
import { spots, SPOT_CATEGORIES } from "@/data/spots"
import { heroStagger, heroItem } from "@/lib/animations"
import { BlobBackground } from "@/components/shared/BlobBackground"
import type { SpotCategory } from "@/types"

const REGIONS = [
  { key: "all", label: "Semua Region", icon: "🌏" },
  { key: "Jawa", label: "Jawa", icon: "🏔️", desc: "Pulau terpadat dengan segudang destinasi" },
  { key: "Bali & Nusa Tenggara", label: "Bali & NT", icon: "🌴", desc: "Surga tropis dengan pantai eksotis" },
  { key: "Sumatera", label: "Sumatera", icon: "🏝️", desc: "Alam liar dan budaya yang kaya" },
  { key: "Sulawesi", label: "Sulawesi", icon: "🦀", desc: "Eksotis dan penuh kejutan" },
  { key: "Kalimantan", label: "Kalimantan", icon: "🌲", desc: "Hutan hujan tropis yang memukau" },
]

const PROVINSI = [...new Set(spots.map((s) => s.province))].sort()

const ALL_CATEGORIES: { key: SpotCategory | "all"; label: string; icon: string }[] = [
  { key: "all", label: "Semua", icon: "🔍" },
  ...Object.entries(SPOT_CATEGORIES).map(([key, val]) => ({
    key: key as SpotCategory,
    label: val.label,
    icon: val.icon,
  })),
]

export default function SpotIstimewaPage() {
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | "all">("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = useMemo(() => {
    return spots.filter((spot) => {
      if (selectedCategory !== "all" && spot.category !== selectedCategory) return false
      if (selectedRegion !== "all" && spot.region !== selectedRegion) return false
      if (selectedProvince !== "all" && spot.province !== selectedProvince) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          spot.name.toLowerCase().includes(q) ||
          spot.description.toLowerCase().includes(q) ||
          spot.province.toLowerCase().includes(q) ||
          spot.tags.some((t) => t.includes(q))
        )
      }
      return true
    })
  }, [selectedCategory, selectedRegion, selectedProvince, searchQuery])

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    spots.forEach((s) => { counts[s.region] = (counts[s.region] || 0) + 1 })
    return counts
  }, [])

  return (
    <>
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background">
        <BlobBackground position="top-right" className="opacity-60" />
        <BlobBackground position="bottom-left" className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32 w-full">
          <motion.div variants={heroStagger} initial="initial" animate="animate" className="max-w-3xl">
            <motion.div variants={heroItem}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm">
                ✨ Tempat Istimewa
              </span>
            </motion.div>
            <motion.h1
              variants={heroItem}
              className="mt-6 text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl font-heading"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Spot{" "}
              <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
                Istimewa
              </span>
            </motion.h1>
            <motion.p variants={heroItem} className="mt-4 text-lg text-muted-foreground max-w-xl">
              Kumpulan tempat-tempat epik di Indonesia yang bikin roadtrip kamu nggak terlupakan. Dikurasi khusus buat kamu.
            </motion.p>

            <motion.div variants={heroItem} className="mt-8">
              <div className="relative max-w-md">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  placeholder="Cari spot, provinsi, atau tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-white/80 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-sm font-semibold font-heading text-muted-foreground uppercase tracking-wider mb-4">Jelajah Berdasarkan Region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {REGIONS.filter((r) => r.key !== "all").map((region) => (
              <button
                key={region.key}
                onClick={() => setSelectedRegion(selectedRegion === region.key ? "all" : region.key)}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedRegion === region.key
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border/50 bg-white hover:border-primary/30 hover:shadow-md"
                }`}
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

      <section className="sticky top-16 z-40 border-b border-border/30 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
            <div className="ml-auto hidden sm:block">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="h-9 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">Semua Provinsi</option>
                {PROVINSI.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> spot ditemukan
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((spot, i) => (
                <motion.div
                  key={spot.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                >
                  <SpotCard spot={spot} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-4xl">🔍</span>
              <p className="mt-4 text-lg font-medium text-foreground">Tidak ada spot yang cocok</p>
              <p className="mt-1 text-sm text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
              <button
                onClick={() => {
                  setSelectedCategory("all")
                  setSelectedRegion("all")
                  setSelectedProvince("all")
                  setSearchQuery("")
                }}
                className="mt-4 text-sm text-primary hover:underline underline-offset-2"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
