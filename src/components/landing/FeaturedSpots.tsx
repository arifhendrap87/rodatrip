"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { SpotCard } from "@/components/spot/SpotCard"
import { spots } from "@/data/spots"
import { staggerContainer, fadeInUp } from "@/lib/animations"

const featured = spots.slice(0, 6)

export function FeaturedSpots() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.02] via-transparent to-secondary/[0.02]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
            ✨ Spot Istimewa
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Tempat-tempat yang Wajib Kamu Kunjungi
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dari hidden gems sampai ikon legendaris — semua tempat ini bikin roadtrip kamu makin epic.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featured.map((spot, i) => (
            <motion.div key={spot.slug} variants={fadeInUp}>
              <SpotCard spot={spot} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/spot-istimewa"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:-translate-y-0.5"
          >
            Lihat Semua Spot Istimewa
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
