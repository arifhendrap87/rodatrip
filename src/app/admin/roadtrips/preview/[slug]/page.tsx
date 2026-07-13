"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import { RoadtripDetailClient } from "@/app/roadtrip/[slug]/client"

export default function RoadtripPreviewPage() {
  const params = useParams()
  const slug = params.slug as string
  const [itinerary, setItinerary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/admin/itineraries/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.id) setItinerary(json.data)
        else setError(json?.error?.message || "Roadtrip tidak ditemukan")
      })
      .catch(() => setError("Gagal memuat roadtrip"))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D95D39]" />
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] gap-4">
        <p className="text-lg font-medium text-[#1E232A]">{error || "Roadtrip tidak ditemukan"}</p>
        <Link href="/admin/roadtrips" className="text-sm text-[#D95D39] hover:underline">
          ← Kembali ke daftar roadtrip
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="sticky top-0 z-50 bg-[#2C4A3E] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/admin/roadtrips"
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Admin
          </Link>
          <span
            className={
              itinerary.isPublished ? "text-green-300" : "text-yellow-300"
            }
          >
            {itinerary.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <RoadtripDetailClient itinerary={itinerary} />
    </div>
  )
}
