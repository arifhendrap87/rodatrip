"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { staggerContainer, fadeInUp } from "@/lib/animations"

const features = [
  {
    icon: "🗺️",
    title: "POI Interaktif",
    lines: ["50+ titik SPBU, bengkel, kuliner,", "spot foto muncul di peta"],
    href: "/map",
    gradient: "from-secondary/10 to-secondary/5",
    iconBg: "bg-secondary/15",
    borderColor: "border-secondary/20",
  },
  {
    icon: "⚠️",
    title: "Info Jalan Real-time",
    lines: ["Update perbaikan jalan, banjir,", "longsor dari Twitter + berita"],
    href: "/map",
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/15",
    borderColor: "border-primary/20",
  },
  {
    icon: "💰",
    title: "Estimasi Biaya",
    lines: ["BBM + Tol + Makan dihitung", "otomatis per kendaraan"],
    href: "/map",
    gradient: "from-accent/10 to-accent/5",
    iconBg: "bg-accent/15",
    borderColor: "border-accent/20",
  },
  {
    icon: "🛒",
    title: "Rekomendasi Aksesori",
    lines: ["Tire inflator, cooler bag, dashcam", "sesuai rute perjalanan"],
    href: "/products",
    gradient: "from-accent/10 to-accent/5",
    iconBg: "bg-accent/15",
    borderColor: "border-accent/20",
  },
]

export function Features() {
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Kenapa Gaskuy?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fitur khusus roadtripper Indonesia — bukan Google Maps biasa.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="mt-12 grid gap-5 sm:grid-cols-2"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <Link href={feature.href}>
                <div className={`group relative overflow-hidden rounded-[2rem] border ${feature.borderColor} bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${feature.gradient}`}>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-5">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${feature.iconBg} ring-1 ring-inset ring-black/5`}
                      >
                        {feature.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold font-heading">{feature.title}</h3>
                        {feature.lines.map((line, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {line}
                          </p>
                        ))}
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary/70 group-hover:text-primary transition-all duration-300">
                          <span className="underline underline-offset-2 decoration-primary/30 group-hover:decoration-primary">Lihat selengkapnya</span>
                          <svg className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
