"use client"

import { useEffect, useState, useMemo } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

interface Spot {
  slug: string
  name: string
  lat: number
  lng: number
  category: string
  province: string
}

const CATEGORY_COLORS: Record<string, string> = {
  alam: "#2C4A3E",
  kuliner: "#D95D39",
  budaya: "#8B5CF6",
  foto: "#3B82F6",
  petualangan: "#F59E0B",
  sejarah: "#6B7280",
}

function MapBoundsUpdater({ spots }: { spots: Spot[] }) {
  const map = useMap()
  useEffect(() => {
    if (spots.length === 0) return
    const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng]))
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
  }, [spots, map])
  return null
}

export default function MapSection() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/spots?limit=50")
      .then((r) => r.json())
      .then((json) => {
        const data = json.data || []
        const valid = data
          .filter((s: any) => {
            const coords = s.location?.coordinates
            return coords && coords[0] !== 0 && coords[1] !== 0
          })
          .map((s: any) => ({
            slug: s.slug,
            name: s.name,
            lat: s.location.coordinates[1],
            lng: s.location.coordinates[0],
            category: s.category,
            province: s.province,
          }))
        setSpots(valid)
      })
      .catch(() => setSpots([]))
      .finally(() => setLoading(false))
  }, [])

  const routePoints = useMemo(() => {
    if (spots.length < 2) return []
    const counts: Record<string, number> = {}
    spots.forEach((s) => {
      counts[s.province] = (counts[s.province] || 0) + 1
    })
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (!top) return []
    return spots
      .filter((s) => s.province === top)
      .slice(0, 8)
      .map((s) => [s.lat, s.lng] as [number, number])
  }, [spots])

  const [visiblePoints, setVisiblePoints] = useState<[number, number][]>([])

  useEffect(() => {
    if (routePoints.length < 2) return
    setVisiblePoints([routePoints[0]])
    let i = 0
    const timer = setInterval(() => {
      i++
      setVisiblePoints(routePoints.slice(0, i + 1))
      if (i >= routePoints.length - 1) clearInterval(timer)
    }, 400)
    return () => clearInterval(timer)
  }, [routePoints])

  if (loading) {
    return <div className="h-full w-full rounded-2xl bg-[#F0EDE8] animate-pulse" />
  }

  const center: [number, number] =
    spots.length > 0 ? [spots[0].lat, spots[0].lng] : [-7.5, 110]

  return (
    <MapContainer
      center={center}
      zoom={8}
      className="h-full w-full rounded-2xl"
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      attributionControl={false}
      key={spots.length}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsUpdater spots={spots} />

      {visiblePoints.length >= 2 && (
        <Polyline
          positions={visiblePoints}
          color="#D95D39"
          weight={3}
          opacity={0.8}
          dashArray="8, 8"
        />
      )}

      {visiblePoints.length > 0 && (
        <CircleMarker
          center={visiblePoints[0]}
          radius={8}
          pathOptions={{
            color: "#D95D39",
            fillColor: "#D95D39",
            fillOpacity: 1,
            weight: 3,
          }}
        />
      )}

      {spots.map((spot) => (
        <CircleMarker
          key={spot.slug}
          center={[spot.lat, spot.lng]}
          radius={5}
          pathOptions={{
            color: CATEGORY_COLORS[spot.category] || "#D95D39",
            fillColor: CATEGORY_COLORS[spot.category] || "#D95D39",
            fillOpacity: 0.8,
            weight: 2,
          }}
        />
      ))}
    </MapContainer>
  )
}
