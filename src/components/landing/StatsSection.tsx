"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const stats = [
  { value: 50, suffix: "+", label: "POI Sepanjang Rute", icon: "🗺️" },
  { value: 1000, suffix: "+", label: "Pengguna Terdaftar", icon: "👥" },
  { value: 5, suffix: "", label: "Kategori POI", icon: "📌" },
  { value: 3, suffix: "", label: "Rute Siap Pakai", icon: "🛣️" },
]

function Counter({ end, suffix }: { end: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <span ref={ref} className="tabular-nums">
      {inView ? end.toLocaleString() : "0"}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-primary/[0.02] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.03] via-transparent to-secondary/[0.03]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl mb-4 ring-1 ring-primary/20 ring-inset">
                {stat.icon}
              </div>
              <p className="text-4xl sm:text-5xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                <Counter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
