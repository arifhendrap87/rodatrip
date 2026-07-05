"use client"

import { useState, useEffect } from "react"
import { Loader2, MapPin, Phone, Globe, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { NearbyPlace, NEARBY_CATEGORIES } from "@/lib/validators/nearby"

interface NearbyPlacesProps {
  lat: number
  lng: number
  category?: (typeof NEARBY_CATEGORIES)[number]
  radius?: number
  limit?: number
  title?: string
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  hotel: { label: "Hotel & Penginapan", icon: "🏨", color: "bg-blue-100 text-blue-700" },
  restaurant: { label: "Restoran & Kuliner", icon: "🍜", color: "bg-orange-100 text-orange-700" },
  fuel: { label: "SPBU Terdekat", icon: "⛽", color: "bg-cyan-100 text-cyan-700" },
  parking: { label: "Area Parkir", icon: "🅿️", color: "bg-green-100 text-green-700" },
  hospital: { label: "Fasilitas Kesehatan", icon: "🏥", color: "bg-red-100 text-red-700" },
  pharmacy: { label: "Apotek", icon: "💊", color: "bg-purple-100 text-purple-700" },
  atm: { label: "ATM & Bank", icon: "🏧", color: "bg-yellow-100 text-yellow-700" },
  mosque: { label: "Tempat Ibadah", icon: "🕌", color: "bg-emerald-100 text-emerald-700" },
  attraction: { label: "Tempat Wisata", icon: "📸", color: "bg-pink-100 text-pink-700" },
  all: { label: "Tempat Terdekat", icon: "📍", color: "bg-gray-100 text-gray-700" },
}

export function NearbyPlaces({
  lat,
  lng,
  category = "all",
  radius = 5000,
  limit = 10,
  title,
}: NearbyPlacesProps) {
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      category,
      radius: String(radius),
      limit: String(limit),
    })

    fetch(`/api/nearby?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error.message)
        setPlaces(json.data?.places || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [lat, lng, category, radius, limit])

  const catInfo = CATEGORY_LABELS[category] || CATEGORY_LABELS.all
  const displayTitle = title || catInfo.label

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Mencari tempat terdekat...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat data tempat terdekat</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{error}</p>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Tidak ditemukan {displayTitle.toLowerCase()} dalam radius {(radius / 1000).toFixed(1)} km
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold font-heading flex items-center gap-2">
          <span>{catInfo.icon}</span>
          <span>{displayTitle}</span>
        </h3>
        <span className="text-xs text-muted-foreground">{places.length} tempat</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {places.map((place) => (
          <a
            key={place.id}
            href={`https://maps.google.com/maps?q=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-border/40 bg-white p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {place.name}
              </p>
              {place.address && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{place.address}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {place.stars && (
                  <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current" />
                    {place.stars}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {place.distance < 1000
                    ? `${place.distance} m`
                    : `${(place.distance / 1000).toFixed(1)} km`}
                </span>
              </div>
              {(place.phone || place.website) && (
                <div className="flex items-center gap-2 mt-1">
                  {place.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Phone className="h-3 w-3" />
                      {place.phone}
                    </span>
                  )}
                  {place.website && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Globe className="h-3 w-3" />
                      <span
                        className="truncate max-w-[120px]"
                        onClick={(e) => {
                          e.preventDefault()
                          window.open(place.website!, "_blank")
                        }}
                      >
                        {place.website.replace(/^https?:\/\//, "")}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 text-center pt-1">
        Data dari OpenStreetMap — jarak dihitung dari lokasi ini
      </p>
    </div>
  )
}
