"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { heroStagger, heroItem } from "@/lib/animations"
import { SITE_NAME, VEHICLES, POPULAR_ROUTES } from "@/lib/constants"

export function Hero() {
  const router = useRouter()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [vehicle, setVehicle] = useState("mobil")
  const [stats] = useState({ roadtrips: "3", poi: "50+" })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination) return
    router.push(`/map?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&vehicle=${vehicle}`)
  }

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85" alt="" className="absolute inset-0 z-0 w-full h-full object-cover" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/50" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-32 w-full">
        <motion.div
          variants={heroStagger}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center text-center"
        >
          <div className="max-w-2xl">
            <motion.div variants={heroItem}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90">
                <span className="h-2 w-2 rounded-full bg-[#D95D39] animate-pulse" />
                🏎️ Panduan Roadtrip · POI · Tips Perjalanan
              </div>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl text-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Rencanakan
              <br />
              <span className="text-[#D95D39]">Roadtrip</span> Impianmu
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-6 text-lg text-white/90 max-w-lg mx-auto"
            >
              Temukan itinerary roadtrip kurasi lengkap dengan timeline, estimasi biaya, dan tips perjalanan.
            </motion.p>

            <motion.div variants={heroItem} className="mt-8 space-y-4">
              <Link href="/roadtrip">
                <Button size="lg" className="h-12 px-8 bg-[#D95D39] text-white font-semibold shadow-lg shadow-[#D95D39]/30 transition-all duration-300 hover:bg-[#D95D39]/90 hover:shadow-xl hover:-translate-y-0.5 rounded-xl">
                  🏎️ Jelajahi Roadtrip
                </Button>
              </Link>

              <details className="group max-w-md mx-auto">
                <summary className="cursor-pointer text-sm text-white/60 hover:text-white/90 transition-colors list-none flex items-center justify-center gap-1 mt-4">
                  <span className="text-xs">🗺️</span> Cari Rute POI + Estimasi Biaya
                  <svg className="w-3 h-3 ml-1 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </summary>
                <form onSubmit={handleSearch} className="mt-3 space-y-3 p-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 shadow-2xl">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Kota asal"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                      list="origin-suggestions"
                      className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 shadow-sm rounded-xl"
                    />
                    <datalist id="origin-suggestions">
                      {POPULAR_ROUTES.map((r) => (
                        <option key={r.label} value={r.origin} />
                      ))}
                    </datalist>
                    <Input
                      placeholder="Kota tujuan"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      list="dest-suggestions"
                      className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 shadow-sm rounded-xl"
                    />
                    <datalist id="dest-suggestions">
                      {POPULAR_ROUTES.map((r) => (
                        <option key={r.label} value={r.destination} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="h-11 flex-1 rounded-xl bg-white/10 border-white/20 text-white px-3 text-sm shadow-sm"
                    >
                      {VEHICLES.map((v) => (
                        <option key={v.id} value={v.id} className="text-[#1E232A]">{v.label}</option>
                      ))}
                    </select>
                    <Button type="submit" className="h-11 px-6 bg-[#D95D39] text-white font-medium shadow-lg hover:shadow-xl rounded-xl">
                      Cari Rute
                    </Button>
                  </div>
                </form>
              </details>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 sm:mt-24"
        >
          <div className="relative flex flex-wrap justify-center gap-8 sm:gap-16 pt-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="text-center">
              <span className="text-3xl font-bold font-heading text-[#D95D39]">{stats.roadtrips}</span>
              <p className="text-sm text-white/90">Roadtrip Itinerary</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold font-heading text-white">{stats.poi}</span>
              <p className="text-sm text-white/90">POI Sepanjang Rute</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
