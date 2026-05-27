"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MapPinIcon, RouteIcon, ShoppingBagIcon } from "@/components/icons"
import { staggerContainer, fadeInUp } from "@/lib/animations"

const values = [
  {
    icon: MapPinIcon,
    title: "Plan",
    description: "Cari rute roadtrip dengan POI interaktif, info kondisi jalan real-time, dan estimasi biaya di satu peta.",
    gradient: "from-secondary/10 to-secondary/5",
    ring: "ring-secondary/25",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20",
  },
  {
    icon: ShoppingBagIcon,
    title: "Prepare",
    description: "Dapat rekomendasi aksesori sesuai rute kamu. Beli perlengkapan roadtrip tanpa repot.",
    gradient: "from-primary/10 to-primary/5",
    ring: "ring-primary/25",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
  },
  {
    icon: RouteIcon,
    title: "Go",
    description: "Trip dengan percaya diri. Share pengalaman dan dapat diskon untuk perjalanan berikutnya.",
    gradient: "from-accent/10 to-accent/5",
    ring: "ring-accent/25",
    iconColor: "text-accent",
    borderColor: "border-accent/20",
  },
]

export function ValueProps() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Satu platform dari rencana sampai perjalanan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Semua yang kamu butuhin untuk roadtrip — POI, info jalan, estimasi biaya, sampai beli aksesori — dalam satu tempat.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {values.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.title} variants={fadeInUp}>
                <Card className={`group overflow-hidden border ${item.borderColor} bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${item.gradient}`} />
                  <CardContent className="relative p-8 text-center">
                    <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center ring-1 ${item.ring} transition-all duration-500 group-hover:scale-110 group-hover:ring-2`}>
                      <Icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <h3 className="mt-6 text-xl font-bold font-heading">{item.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
