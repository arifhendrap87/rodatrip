"use client"

import { motion } from "framer-motion"
import { fadeInUp } from "@/lib/animations"

interface FadeInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeInView({ children, className, delay = 0 }: FadeInViewProps) {
  return (
    <motion.div
      {...fadeInUp}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
