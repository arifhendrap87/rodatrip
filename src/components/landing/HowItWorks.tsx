"use client"

import { motion } from "framer-motion"
import { staggerContainer, fadeInUp } from "@/lib/animations"

const steps = [
  {
    number: "01",
    title: "Cari Rute",
    description: "Masukkan kota asal dan tujuan. Lihat rute terbaik dengan POI dan info jalan di sepanjang perjalanan.",
    icon: "🔍",
    gradient: "from-primary/20 to-primary/5",
    ringColor: "ring-primary/30",
  },
  {
    number: "02",
    title: "Siapkan Perlengkapan",
    description: "Dapat rekomendasi aksesori yang pas buat rute kamu. Beli langsung di platform.",
    icon: "🎒",
    gradient: "from-secondary/20 to-secondary/5",
    ringColor: "ring-secondary/30",
  },
  {
    number: "03",
    title: "Trip!",
    description: "Berangkat dengan tenang. Share pengalaman dan dapat diskon untuk petualangan berikutnya.",
    icon: "🚗",
    gradient: "from-accent/20 to-accent/5",
    ringColor: "ring-accent/30",
  },
]

export function HowItWorks() {
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
            Cara Kerjanya
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tiga langkah mudah dari rencana sampai berangkat.
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-[hsl(340_85%_55%)]/30 to-accent/30 -translate-x-1/2" />

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="grid gap-16 md:gap-24"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="relative grid md:grid-cols-2 gap-8 items-center"
              >
                {index % 2 === 0 ? (
                  <>
                    <div className="text-right md:pr-20">
                      <span className="text-7xl font-bold font-heading text-primary/15 block leading-none">{step.number}</span>
                      <h3 className="mt-4 text-2xl font-bold font-heading">{step.title}</h3>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-4xl ring-2 ${step.ringColor} shadow-lg shadow-primary/10`}>
                        {step.icon}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden md:flex items-center justify-center order-2">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-4xl ring-2 ${step.ringColor} shadow-lg shadow-secondary/10`}>
                        {step.icon}
                      </div>
                    </div>
                    <div className="md:pl-20 order-1 md:order-3">
                      <span className="text-7xl font-bold font-heading text-secondary/15 block leading-none">{step.number}</span>
                      <h3 className="mt-4 text-2xl font-bold font-heading">{step.title}</h3>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
