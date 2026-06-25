"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const testimonials = [
  {
    name: "Budi",
    role: "Roadtripper Jakarta",
    avatar: "B",
    text: "Akhirnya ada platform khusus roadtrip Indonesia. Biasanya buka Google Maps + Instagram + Twitter buat cari info jalan. Sekarang cukup RodaTrip.",
    rating: 5,
  },
  {
    name: "Sari",
    role: "Weekend Rider Bandung",
    avatar: "S",
    text: "Fitur estimasi biayanya bener-bener membantu. Tinggal masukin rute + kendaraan, langsung tau budgetnya. Sayang banget kalau nggak ada.",
    rating: 5,
  },
  {
    name: "Dimas",
    role: "Touring Enthusiast",
    avatar: "D",
    text: "Info kondisi jalan real-time dari Twitter langsung muncul di peta. Pas banget buat yang sering touring jarak jauh kayak gue.",
    rating: 5,
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-accent/[0.05]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Apa Kata Mereka
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Yang udah cobain RodaTrip — bukan kita yang bilang.
          </p>
        </motion.div>

        <div className="relative mt-10 mx-auto max-w-2xl">
          <div className="min-h-[240px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="rounded-[2rem] border border-primary/15 bg-white shadow-md p-8 sm:p-10">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic text-base">
                    &ldquo;{testimonials[current].text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-base font-bold text-primary ring-2 ring-primary/20">
                      {testimonials[current].avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonials[current].name}</p>
                      <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white shadow-sm transition-all hover:shadow-md text-primary hover:text-primary/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-10 bg-primary" : "w-2.5 bg-primary/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white shadow-sm transition-all hover:shadow-md text-primary hover:text-primary/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
