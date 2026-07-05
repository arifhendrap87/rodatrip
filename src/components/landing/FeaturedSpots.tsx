"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { SpotCard } from "@/components/spot/SpotCard"
import { api } from "@/lib/api/client"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function FeaturedSpots() {
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    api.spots
      .list({ limit: "10" })
      .then((res) => setSpots(res.data || []))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false))
  }, [])

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    checkScroll()
    return () => el.removeEventListener("scroll", checkScroll)
  }, [spots, checkScroll])

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.querySelector("a")?.offsetWidth || 320
    scrollRef.current.scrollBy({
      left: dir === "left" ? -(cardWidth + 24) : cardWidth + 24,
      behavior: "smooth",
    })
  }

  if (spots.length === 0 && !loading) return null

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#F0EDE8]">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
              ✨ Tempat Istimewa
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading mt-3">
              Spot Pilihan
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Hidden gems, panorama ikonik, dan tempat seru di sepanjang rute roadtrip kamu.
            </p>
          </motion.div>

          <div className="hidden sm:flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[300px] sm:min-w-[340px] animate-pulse rounded-[2rem] border border-border/50 bg-white overflow-hidden shrink-0 h-full"
              >
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            {spots.map((spot) => (
              <div key={spot.slug} className="min-w-[300px] sm:min-w-[340px] snap-start shrink-0">
                <SpotCard spot={spot} fullHeight />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 sm:hidden flex justify-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href="/spot-istimewa"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Lihat Semua Spot
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
