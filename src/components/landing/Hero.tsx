"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/60" />
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
                POI · Info Jalan · E-commerce
              </div>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-6 text-6xl font-bold leading-none tracking-tight sm:text-7xl lg:text-8xl font-heading [filter:drop-shadow(0_4px_8px_rgba(255,107,53,0.3))]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Rencanakan
              <br />
              <GradientText as="span" className="text-6xl sm:text-7xl lg:text-8xl font-bold">
                Roadtrip Impianmu
              </GradientText>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-6 text-lg text-muted-foreground max-w-lg"
            >
              SPBU, info jalan, estimasi biaya, dan beli aksesori — tanpa buka aplikasi lain.
            </motion.p>

            <motion.div variants={heroItem}>
              <form onSubmit={handleSearch} className="mt-8 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Kota asal"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    list="origin-suggestions"
                    className="h-12 bg-white/80 border-border shadow-sm backdrop-blur-sm rounded-xl"
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
                    className="h-12 bg-white/80 border-border shadow-sm backdrop-blur-sm rounded-xl"
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
                    className="h-12 flex-1 rounded-xl border border-border bg-white/80 px-3 text-sm shadow-sm backdrop-blur-sm"
                  >
                    {VEHICLES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:-translate-y-0.5 rounded-xl min-w-[140px]"
                  >
                    Cari Rute
                  </Button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Populer:</span>
                {POPULAR_ROUTES.slice(0, 3).map((r) => (
                  <button
                    key={r.label}
                    onClick={() => {
                      setOrigin(r.origin)
                      setDestination(r.destination)
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={heroItem}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-primary/5 border border-border/30">
              <div className="absolute inset-0 flex">
                <div className="w-1/3 bg-gray-50/80 border-r border-gray-100 p-3 space-y-2">
                  <div className="h-6 w-full rounded-md bg-white border border-gray-100 shadow-sm flex items-center px-2">
                    <span className="text-[10px] text-gray-400">Jakarta</span>
                  </div>
                  <div className="h-6 w-full rounded-md bg-white border border-gray-100 shadow-sm flex items-center px-2">
                    <span className="text-[10px] text-gray-400">Yogyakarta</span>
                  </div>
                  <div className="h-6 w-full rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-primary">Cari Rute</span>
                  </div>
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span className="text-[9px] text-gray-400">SPBU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span className="text-[9px] text-gray-400">Kuliner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span className="text-[9px] text-gray-400">Info Jalan</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <span className="text-[9px] text-gray-300">Estimasi: Rp 950k</span>
                  </div>
                </div>
                <div className="flex-1 relative bg-[#f0f0f0]">
                  <svg viewBox="0 0 300 250" className="w-full h-full p-3">
                    <path d="M20 140 Q60 120 100 135 Q140 150 180 130 Q220 110 260 125" stroke="#ddd" strokeWidth="1" fill="none" />
                    <path d="M20 140 L60 130 L100 140 L140 150 L180 130 L220 120 L260 130" stroke="#FF6B35" strokeWidth="2.5" strokeDasharray="5 3" fill="none" opacity="0.8" />
                    <circle cx="20" cy="140" r="6" fill="#FF6B35" />
                    <text x="12" y="128" fontSize="7" fill="#FF6B35" fontWeight="bold">JKT</text>
                    <circle cx="260" cy="130" r="6" fill="#FF6B35" />
                    <text x="252" y="118" fontSize="7" fill="#FF6B35" fontWeight="bold">JOG</text>
                    <circle cx="60" cy="130" r="4" fill="#3B82F6" />
                    <circle cx="100" cy="140" r="4" fill="#F97316" />
                    <circle cx="180" cy="130" r="4" fill="#A855F7" />
                    <circle cx="140" cy="150" r="4" fill="#3B82F6" />
                    <circle cx="110" cy="138" r="5" fill="#EF4444" />
                    <text x="107" y="141" fontSize="6" fill="white" fontWeight="bold">⚠</text>
                  </svg>
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-lg border border-gray-100 shadow-sm p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium">SPBU Pertamina Km 45</p>
                        <p className="text-[8px] text-gray-400">⭐ 4.2 · Cianjur</p>
                      </div>
                      <span className="text-sm">⛽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-lg border border-border/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="text-sm font-medium text-foreground">50+ POI sepanjang rute</span>
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
              <span className="text-3xl font-bold font-heading text-primary">50+</span>
              <p className="text-sm text-muted-foreground">POI</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold font-heading text-secondary">5</span>
              <p className="text-sm text-muted-foreground">Kategori</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold font-heading text-accent">3</span>
              <p className="text-sm text-muted-foreground">Rute</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
