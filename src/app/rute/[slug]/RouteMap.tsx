"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Route, POI } from "@/types"

interface RouteMapProps {
  route: Route
  pois: POI[]
}

const categoryConfig: Record<string, { color: string; icon: string }> = {
  spbu: { color: "#3B82F6", icon: "⛽" },
  kuliner: { color: "#F97316", icon: "🍜" },
  bengkel: { color: "#6B7280", icon: "🔧" },
  spot_foto: { color: "#A855F7", icon: "📸" },
  info_jalan: { color: "#EF4444", icon: "⚠️" },
}

function createMarkerIcon(category: string): L.DivIcon {
  const config = categoryConfig[category] || { color: "#71717A", icon: "📍" }
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:32px;height:32px;background:white;border:2px solid ${config.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">${config.icon}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function formatPopupHTML(poi: POI): string {
  const config = categoryConfig[poi.category] || { color: "#71717A", icon: "📍" }
  return `
    <div style="font-family:system-ui;min-width:180px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span>${config.icon}</span>
        <strong style="font-size:13px;">${poi.name}</strong>
      </div>
      ${poi.rating > 0 ? `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;"><span style="color:#f59e0b;">★</span><span style="font-size:12px;color:#52525b;">${poi.rating.toFixed(1)}</span></div>` : ""}
      <p style="font-size:11px;color:#71717a;margin:0;">${poi.address}</p>
    </div>
  `
}

export default function RouteMap({ route, pois }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const latlngs = route.polyline.map((c: [number, number]) => [c[0], c[1]] as [number, number])

    const map = L.map(containerRef.current, {
      center: latlngs[Math.floor(latlngs.length / 2)],
      zoom: 9,
      zoomControl: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    L.polyline(latlngs, {
      color: "#FF6B35",
      weight: 4,
      opacity: 0.8,
      dashArray: "10, 8",
    }).addTo(map)

    pois.forEach((poi) => {
      L.marker([poi.latitude, poi.longitude], { icon: createMarkerIcon(poi.category) })
        .addTo(map)
        .bindPopup(formatPopupHTML(poi))
    })

    const bounds = L.latLngBounds(latlngs)
    pois.forEach((poi) => bounds.extend([poi.latitude, poi.longitude]))
    map.fitBounds(bounds, { padding: [30, 30] })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [route, pois])

  return <div ref={containerRef} className="w-full h-full" />
}
