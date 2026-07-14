"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import { SpotDetailClient } from "@/components/spot/SpotDetailClient"
import type { SpotData } from "@/lib/services/spots"
import type { Itinerary } from "@/types"

export default function SpotPreviewPage() {
  const params = useParams()
  const slug = params.slug as string
  const [spot, setSpot] = useState<SpotData | null>(null)
  const [relatedItineraries, setRelatedItineraries] = useState<Itinerary[]>([])
  const [allSpots, setAllSpots] = useState<SpotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [spotRes, itinerariesRes, spotsRes] = await Promise.all([
          fetch(`/api/spots/${slug}`),
          fetch(`/api/itineraries?spotSlug=${slug}`),
          fetch(`/api/spots?limit=100`),
        ])
        const spotJson = await spotRes.json()
        if (!spotJson.data?.id) {
          setError(spotJson?.error?.message || "Spot tidak ditemukan")
          return
        }
        setSpot(spotJson.data)
        const itinJson = await itinerariesRes.json()
        setRelatedItineraries(itinJson.data || [])
        const spotsJson = await spotsRes.json()
        setAllSpots(spotsJson.data || [])
      } catch {
        setError("Gagal memuat spot")
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D95D39]" />
      </div>
    )
  }

  if (error || !spot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] gap-4">
        <p className="text-lg font-medium text-[#1E232A]">{error || "Spot tidak ditemukan"}</p>
        <Link href="/admin/spots" className="text-sm text-[#D95D39] hover:underline">
          ← Kembali ke daftar spot
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="sticky top-0 z-50 bg-[#2C4A3E] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/admin/spots"
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Admin
          </Link>
          <span
            className={
              (spot as any).is_published !== false
                ? "text-green-300"
                : "text-yellow-300"
            }
          >
            {(spot as any).is_published !== false ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <SpotDetailClient spot={spot} relatedItineraries={relatedItineraries} allSpots={allSpots} />
    </div>
  )
}
