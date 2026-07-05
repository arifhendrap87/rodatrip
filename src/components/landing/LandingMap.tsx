"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const MapSection = dynamic(() => import("./MapSection"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#F0EDE8] animate-pulse" />
  ),
})

const BENEFITS = [
  {
    icon: "📍",
    title: "POI Lengkap",
    desc: "Ratusan spot menarik dari alam, kuliner, hingga petualangan.",
    color: "#D95D39",
  },
  {
    icon: "🗺️",
    title: "Rute Kurasi",
    desc: "Itinerary siap pakai dengan timeline, estimasi biaya, dan tips perjalanan.",
    color: "#2C4A3E",
  },
  {
    icon: "💰",
    title: "Estimasi Biaya",
    desc: "Hitung estimasi BBM, tol, tiket masuk, dan akomodasi.",
    color: "#D95D39",
  },
]

export function LandingMap() {
  return (
    <section className="relative min-h-[550px] sm:min-h-[600px] overflow-hidden bg-[#F0EDE8]">
      {/* Map background — full width */}
      <div className="absolute inset-0 z-0">
        <MapSection />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl border border-border/50"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 backdrop-blur-sm px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
            🗺️ Rencanakan Perjalanan
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Rencanakan Roadtrip-mu dalam Hitungan Menit
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Temukan spot-spot menarik, atur itinerary, dan estimasi biaya
            perjalanan — semua dalam satu platform.
          </p>

          {/* Timeline Steps */}
          <div className="relative mt-10 ml-2">
            <div className="absolute left-[17px] top-3 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-accent/20 to-primary/10" />

            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.3 + i * 0.25,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="relative mb-8 last:mb-0"
              >
                <div className="flex items-start gap-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.4 + i * 0.25,
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                    }}
                    className="relative z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: b.color }}
                  >
                    {i + 1}
                  </motion.div>

                  <div className="flex-1 rounded-xl border border-border/50 bg-white/95 backdrop-blur-sm p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <motion.span
                        className="text-xl"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.5 + i * 0.25,
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                      >
                        {b.icon}
                      </motion.span>
                      <div>
                        <h3 className="font-semibold font-heading">
                          {b.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/roadtrip">
              <Button size="lg" className="h-12 px-8 gap-2 rounded-xl">
                Mulai Jelajahi
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
