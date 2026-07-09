"use client"

import { useState } from "react"

export function SpotHeroImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <img
      src="/placeholder.svg"
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}
