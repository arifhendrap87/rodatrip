"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({ children, className, glowColor = "primary" }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50",
        "bg-card/50 backdrop-blur-xl",
        "transition-all duration-500",
        "hover:border-primary/30 hover:-translate-y-1",
        "hover:shadow-xl",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          `bg-gradient-to-b from-${glowColor}/5 to-transparent`
        )}
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
