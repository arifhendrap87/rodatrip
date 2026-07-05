"use client"

import { useEffect, useState, useMemo, useRef } from "react"
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

const FALLBACK_SPOTS: Spot[] = [
  { slug: "kawah-putih", name: "Kawah Putih Ciwidey", lat: -7.1660, lng: 107.4042, category: "alam", province: "Jawa Barat" },
  { slug: "kebun-teh-rancabali", name: "Kebun Teh Rancabali", lat: -7.1450, lng: 107.3750, category: "alam", province: "Jawa Barat" },
  { slug: "situ-patenggang", name: "Situ Patenggang", lat: -7.1500, lng: 107.3600, category: "alam", province: "Jawa Barat" },
  { slug: "tangkuban-perahu", name: "Tangkuban Perahu", lat: -6.7590, lng: 107.6090, category: "alam", province: "Jawa Barat" },
  { slug: "farmhouse-lembang", name: "Farmhouse Lembang", lat: -6.8130, lng: 107.6180, category: "petualangan", province: "Jawa Barat" },
  { slug: "floating-market", name: "Floating Market Lembang", lat: -6.8160, lng: 107.6200, category: "kuliner", province: "Jawa Barat" },
  { slug: "dusun-bambu", name: "Dusun Bambu", lat: -6.7900, lng: 107.5800, category: "alam", province: "Jawa Barat" },
  { slug: "orchid-forest", name: "Orchid Forest Cikole", lat: -6.7770, lng: 107.6450, category: "alam", province: "Jawa Barat" },
]

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
        setSpots(valid.length >= 2 ? valid : FALLBACK_SPOTS)
      })
      .catch(() => setSpots(FALLBACK_SPOTS))
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

  const DURATION_MS = 1800
  const PULSE_MS = 600

  const [phase, setPhase] = useState<"idle" | "draw" | "move" | "done">("idle")
  const [drawCount, setDrawCount] = useState(1)
  const [segIdx, setSegIdx] = useState(0)
  const [segProg, setSegProg] = useState(0)
  const [pulseStop, setPulseStop] = useState(-1)
  const moved = useRef(false)
  const drawTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const loopRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function startDraw() {
    setPhase("draw")
    setDrawCount(1)
    setSegIdx(0)
    setSegProg(0)
    setPulseStop(-1)
    moved.current = false
    clearInterval(drawTimerRef.current)
    let i = 1
    drawTimerRef.current = setInterval(() => {
      i++
      setDrawCount(i)
      if (i >= routePoints.length) {
        clearInterval(drawTimerRef.current)
        setTimeout(() => setPhase("move"), 500)
      }
    }, 400)
  }

  useEffect(() => {
    if (routePoints.length < 2) return
    startDraw()
    return () => {
      clearInterval(drawTimerRef.current)
      clearTimeout(loopRef.current)
    }
  }, [routePoints])

  useEffect(() => {
    if (phase !== "done" || routePoints.length < 2) return
    loopRef.current = setTimeout(() => {
      startDraw()
    }, 4000)
    return () => clearTimeout(loopRef.current)
  }, [phase, routePoints])

  useEffect(() => {
    if (phase !== "move" || routePoints.length < 2) return
    if (moved.current) return
    moved.current = true

    let animId: number
    let last = performance.now()
    let segIdxLocal = 0
    let segProgLocal = 0
    let pulsing = false
    let pulseDone = 0

    function tick(now: number) {
      const dt = now - last
      last = now

      if (pulsing) {
        if (Date.now() - pulseDone < PULSE_MS) {
          animId = requestAnimationFrame(tick)
          return
        }
        pulsing = false
        setPulseStop(-1)
      }

      segProgLocal += dt / DURATION_MS
      if (segProgLocal >= 1) {
        segProgLocal = 0
        segIdxLocal++
        setPulseStop(segIdxLocal)
        pulsing = true
        pulseDone = Date.now()
        if (segIdxLocal >= routePoints.length - 1) {
          setPhase("done")
          setSegIdx(segIdxLocal)
          setSegProg(1)
          return
        }
        setSegIdx(segIdxLocal)
      }
      setSegProg(segProgLocal)
      setSegIdx(segIdxLocal)
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [phase, routePoints])

  const markerPos: [number, number] | null =
    phase === "move" && segIdx < routePoints.length - 1
      ? [
          routePoints[segIdx][0] +
            (routePoints[segIdx + 1][0] - routePoints[segIdx][0]) * segProg,
          routePoints[segIdx][1] +
            (routePoints[segIdx + 1][1] - routePoints[segIdx][1]) * segProg,
        ]
      : phase === "done" && routePoints.length > 0
        ? routePoints[routePoints.length - 1]
        : null

  if (loading) {
    return (
      <div className="h-full w-full bg-[#F0EDE8] animate-pulse" />
    )
  }

  const center: [number, number] =
    spots.length > 0 ? [spots[0].lat, spots[0].lng] : [-7.5, 110]

  return (
    <MapContainer
      center={center}
      zoom={8}
      className="h-full w-full"
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

      {/* Route segments */}
      {routePoints.length >= 2 &&
        routePoints.slice(0, -1).map((start, i) => {
          const end = routePoints[i + 1]
          const drawn = phase === "idle" || (phase === "draw" && i < drawCount)
          const visited =
            phase === "done" || (phase === "move" && i < segIdx)
          const current = phase === "move" && i === segIdx
          const future = phase === "draw" || phase === "done" ? false : !visited && !current

          if (phase === "draw" && !drawn) return null

          const midLat =
            current
              ? start[0] + (end[0] - start[0]) * segProg
              : end[0]
          const midLng =
            current
              ? start[1] + (end[1] - start[1]) * segProg
              : end[1]

          if (current) {
            return (
              <Polyline
                key={`seg-${i}`}
                positions={
                  [
                    [start[0], start[1]],
                    [midLat, midLng],
                  ] as [number, number][]
                }
                color="#D95D39"
                weight={3}
                opacity={0.9}
              />
            )
          }

          if (future) return null

          return (
            <Polyline
              key={`seg-${i}`}
              positions={[start, end] as [number, number][]}
              color={visited ? "#D95D39" : "#D95D39"}
              weight={3}
              opacity={visited ? 1 : 0.35}
              dashArray={visited ? undefined : "8, 8"}
            />
          )
        })}

      {/* Moving marker */}
      {markerPos && (
        <CircleMarker
          center={markerPos}
          radius={7}
          pathOptions={{
            color: "#fff",
            fillColor: "#D95D39",
            fillOpacity: 1,
            weight: 3,
          }}
        />
      )}

      {/* Pulse effect at stop */}
      {pulseStop >= 0 && pulseStop < routePoints.length && (
        <CircleMarker
          center={routePoints[pulseStop]}
          radius={16}
          pathOptions={{
            color: "#D95D39",
            fillColor: "#D95D39",
            fillOpacity: 0.15,
            weight: 3,
          }}
        />
      )}

      {/* Spot markers */}
      {spots.map((spot) => {
        const isRoutePoint = routePoints.some(
          (rp) => rp[0] === spot.lat && rp[1] === spot.lng
        )
        return (
          <CircleMarker
            key={spot.slug}
            center={[spot.lat, spot.lng]}
            radius={isRoutePoint ? 5 : 4}
            pathOptions={{
              color: CATEGORY_COLORS[spot.category] || "#D95D39",
              fillColor: CATEGORY_COLORS[spot.category] || "#D95D39",
              fillOpacity: isRoutePoint ? 1 : 0.6,
              weight: isRoutePoint ? 2.5 : 1.5,
            }}
          />
        )
      })}
    </MapContainer>
  )
}
