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
    api.spots.list({ limit: "6" })
      .then((res) => setSpots(res.data || []))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.02] via-transparent to-secondary/[0.02]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">✨ Spot Istimewa</span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Tempat-tempat yang Wajib Kamu Kunjungi</h2>
          <p className="mt-4 text-muted-foreground">Dari hidden gems sampai ikon legendaris — semua tempat ini bikin roadtrip kamu makin epic.</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border/50 bg-white overflow-hidden">
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 rounded-full bg-muted" />
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))
          ) : (
            spots.map((spot, i) => (
              <motion.div key={spot.slug} variants={fadeInUp}>
                <SpotCard spot={spot} />
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center">
          <Link href="/spot-istimewa" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Lihat Semua Spot
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
