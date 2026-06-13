"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">😵</div>
        <h1 className="text-2xl font-bold font-heading mb-2">Ada yang tidak beres</h1>
        <p className="text-muted-foreground mb-6">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Coba Lagi</Button>
          <Link href="/">
            <Button variant="outline">Ke Beranda</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
