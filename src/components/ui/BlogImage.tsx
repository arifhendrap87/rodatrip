"use client"

import { useState } from "react"

export function BlogImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={alt}
        className={className || "w-full h-full object-cover"}
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
      <span className="text-6xl opacity-30">🚗</span>
    </div>
  )
}
