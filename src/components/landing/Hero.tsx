"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradientText } from "@/components/shared/GradientText"
import { BlobBackground } from "@/components/shared/BlobBackground"
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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <Image
        src="/images/hero-bg.jpg"
        alt="Pemandangan jalan berkelok di pegunungan tropis — siap untuk roadtrip"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/50 to-white/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.08] via-transparent to-transparent" />
      <BlobBackground position="top-right" className="opacity-70" />
      <BlobBackground position="bottom-left" className="opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-32 w-full">
        <motion.div
          variants={heroStagger}
          initial="initial"
          animate="animate"
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <div className="max-w-xl">
            <motion.div variants={heroItem}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                🏎️ Panduan Roadtrip · POI · Tips Perjalanan
              </div>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl font-heading"
            >
              Rencanakan
              <br />
              <GradientText as="span" className="text-5xl sm:text-6xl lg:text-7xl font-bold">
                Roadtrip Impianmu
              </GradientText>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-6 text-lg text-muted-foreground max-w-lg"
            >
              Temukan itinerary roadtrip kurasi lengkap dengan timeline, estimasi biaya, dan tips perjalanan.
            </motion.p>

            <motion.div variants={heroItem} className="mt-8 space-y-4">
              <Link href="/roadtrip">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:-translate-y-0.5 rounded-xl">
                  🏎️ Jelajahi Roadtrip
                </Button>
              </Link>

              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-1 mt-4">
                  <span className="text-xs">🗺️</span> Cari Rute POI + Estimasi Biaya
                  <svg className="w-3 h-3 ml-1 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </summary>
                <form onSubmit={handleSearch} className="mt-3 space-y-3 p-4 rounded-xl border border-border/50 bg-white/70 backdrop-blur-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Kota asal"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                      list="origin-suggestions"
                      className="h-11 bg-white border-border shadow-sm rounded-xl"
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
                      className="h-11 bg-white border-border shadow-sm rounded-xl"
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
                      className="h-11 flex-1 rounded-xl border border-border bg-white px-3 text-sm shadow-sm"
                    >
                      {VEHICLES.map((v) => (
                        <option key={v.id} value={v.id}>{v.label}</option>
                      ))}
                    </select>
                    <Button type="submit" className="h-11 px-6 bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md rounded-xl">
                      Cari Rute
                    </Button>
                  </div>
                </form>
              </details>
            </motion.div>
          </div>

          <motion.div variants={heroItem} className="relative hidden lg:block">
            <div className="space-y-4">
              <Link href="/roadtrip" className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-border/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="text-5xl">🏎️</span>
                      <h3 className="mt-3 text-xl font-bold font-heading">Jelajahi Roadtrip Kurasi</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Panduan itinerary lengkap dengan timeline, estimasi biaya, dan tips perjalanan</p>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="rounded-2xl bg-white shadow-lg border border-border/30 p-5">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🗺️</span>
                  <div>
                    <p className="font-semibold font-heading">POI Interaktif</p>
                    <p className="text-xs text-muted-foreground mt-0.5">SPBU, kuliner, bengkel, spot foto sepanjang rute</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 sm:mt-24"
        >
          <div className="relative flex flex-wrap gap-8 sm:gap-16 pt-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="text-center">
              <span className="text-3xl font-bold font-heading text-primary">{stats.roadtrips}</span>
              <p className="text-sm text-muted-foreground">Roadtrip Itinerary</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold font-heading text-accent">{stats.poi}</span>
              <p className="text-sm text-muted-foreground">POI Sepanjang Rute</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
