"use client"

"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { POI, Route } from "@/types"

interface MapViewProps {
  pois: POI[]
  selectedRoute: Route | null
  selectedPOI: POI | null
  onSelectPOI: (poi: POI | null) => void
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
    html: `<div style="
      width: 36px; height: 36px;
      background: white;
      border: 2px solid ${config.color};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: transform 0.2s;
    ">${config.icon}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function formatPopupHTML(poi: POI): string {
  const config = categoryConfig[poi.category] || { color: "#71717A", icon: "📍" }
  return `
    <div style="font-family: system-ui; min-width: 200px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">${config.icon}</span>
        <strong style="font-size: 14px;">${poi.name}</strong>
      </div>
      ${poi.rating > 0 ? `
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
          <span style="color: #f59e0b;">★</span>
          <span style="font-size: 13px; color: #52525b;">${poi.rating.toFixed(1)}</span>
        </div>
      ` : ""}
      <p style="font-size: 12px; color: #71717a; margin: 0;">${poi.address}</p>
      ${poi.description ? `<p style="font-size: 12px; color: #52525b; margin-top: 4px;">${poi.description}</p>` : ""}
    </div>
  `
}

export function MapView({ pois, selectedRoute, selectedPOI, onSelectPOI }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [-7.2, 109.5] as [number, number],
      zoom: 8,
      zoomControl: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    pois.forEach((poi) => {
      const marker = L.marker([poi.latitude, poi.longitude], {
        icon: createMarkerIcon(poi.category),
      })
        .addTo(map)
        .bindPopup(formatPopupHTML(poi), {
          closeButton: true,
          className: "custom-popup",
        })

      marker.on("click", () => onSelectPOI(poi))
      markersRef.current.push(marker)
    })
  }, [pois, onSelectPOI])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (selectedRoute) {
      const latlngs = selectedRoute.polyline.map(
        (coord: [number, number]) => [coord[0], coord[1]] as [number, number]
      )

      polylineRef.current = L.polyline(latlngs, {
        color: "#FF6B35",
        weight: 4,
        opacity: 0.8,
        dashArray: "10, 8",
      }).addTo(map)

      const bounds = L.latLngBounds(latlngs)
      pois.forEach((poi) => bounds.extend([poi.latitude, poi.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [selectedRoute, pois])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedPOI) return

    map.setView([selectedPOI.latitude, selectedPOI.longitude], 14, {
      animate: true,
    })

    markersRef.current.forEach((marker) => {
      const latlng = marker.getLatLng()
      if (latlng.lat === selectedPOI.latitude && latlng.lng === selectedPOI.longitude) {
        marker.openPopup()
      }
    })
  }, [selectedPOI])

  return (
    <div ref={mapContainerRef} className="flex-1 h-full" />
  )
}

export default MapView
