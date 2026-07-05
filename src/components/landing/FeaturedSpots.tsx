"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { SpotCard } from "@/components/spot/SpotCard"
import { api } from "@/lib/api/client"
import { staggerContainer, fadeInUp } from "@/lib/animations"

export function FeaturedSpots() {
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.spots
      .list({ limit: "8" })
      .then((res) => setSpots(res.data || []))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false))
  }, [])

  if (spots.length === 0 && !loading) return null

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#F0EDE8]">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
            ✨ Tempat Istimewa
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Spot Pilihan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Hidden gems, panorama ikonik, dan tempat seru di sepanjang rute roadtrip kamu.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="mt-12 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-[2rem] border border-border/50 bg-white overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))
            : spots.map((spot, i) => (
                <motion.div key={spot.slug} variants={fadeInUp}>
                  <SpotCard spot={spot} />
                </motion.div>
              ))}
        </motion.div>

        {!loading && spots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
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
        )}
      </div>
    </section>
  )
}
