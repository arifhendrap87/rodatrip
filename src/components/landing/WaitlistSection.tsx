"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fadeInUp } from "@/lib/animations"

export function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section id="waitlist" className="relative py-24 sm:py-32 overflow-hidden">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        className="relative mx-auto max-w-2xl px-4 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
          Mulai Petualanganmu
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Daftar sekarang dan jadi yang pertama mencoba RodaTrip.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 flex max-w-md mx-auto gap-3">
            <Input
              type="email"
              placeholder="Masukkan email kamu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 flex-1 bg-white border-primary/20 shadow-sm text-base rounded-xl"
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:-translate-y-0.5 rounded-xl"
            >
              Daftar Sekarang
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 mx-auto max-w-md rounded-2xl border border-accent/30 bg-accent/10 px-6 py-5"
          >
            <p className="font-medium text-accent">Kamu terdaftar! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">Kami akan kabari kamu begitu platform ready.</p>
          </motion.div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            1.000+ waitlist
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Gratis selamanya
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            No spam
          </span>
        </div>
      </motion.div>
    </section>
  )
}
