"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { heroStagger, heroItem } from "@/lib/animations"

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = Math.max(1, Math.floor(value / 60))
    const interval = setInterval(() => {
      start += step
      if (start >= value) {
        setDisplay(value)
        clearInterval(interval)
      } else {
        setDisplay(start)
      }
    }, duration / (value / step))
    return () => clearInterval(interval)
  }, [inView, value])

  return (
    <span ref={ref} className="text-3xl font-bold font-heading">
      {display}{suffix}
    </span>
  )
}

export function Hero() {
  const [stats, setStats] = useState({ roadtrips: 3, spots: 50 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/itineraries").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/spots?limit=1").then((r) => r.json()).catch(() => ({ pagination: { total: 0 } })),
    ]).then(([itinRes, spotRes]) => {
      setStats({
        roadtrips: (itinRes.data || []).length,
        spots: spotRes.pagination?.total || spotRes.data?.length || 0,
      })
      setLoaded(true)
    })
  }, [])

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85" alt="" className="absolute inset-0 z-0 w-full h-full object-cover" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/60 to-black/70" />
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

            <motion.div variants={heroItem} className="mt-8">
              <Link href="/roadtrip">
                <Button size="lg" className="h-12 px-8 bg-[#D95D39] text-white font-semibold shadow-lg shadow-[#D95D39]/30 transition-all duration-300 hover:bg-[#D95D39]/90 hover:shadow-xl hover:-translate-y-0.5 rounded-xl">
                  🏎️ Jelajahi Roadtrip
                </Button>
              </Link>
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
              <span className="text-[#D95D39]">
                <AnimatedCounter value={stats.roadtrips} />
              </span>
              <p className="text-sm text-white/90">Roadtrip Itinerary</p>
            </div>
            <div className="text-center">
              <span className="text-white">
                <AnimatedCounter value={stats.spots} />
              </span>
              <p className="text-sm text-white/90">POI Sepanjang Rute</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
