"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { MapSidebar } from "@/components/map/MapSidebar"
import type { POI } from "@/types"
import { VEHICLES, FUEL_PRICE } from "@/lib/constants"

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false })

interface APIRoute {
  id: string
  name: string
  slug: string
  origin: string
  destination: string
  distance_km: number
  duration_hours: number
  polyline: [number, number][]
  poi_ids?: string[]
}

function MapContent() {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const vehicleParam = searchParams.get("vehicle")

  const [pois, setPois] = useState<POI[]>([])
  const [routes, setRoutes] = useState<APIRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<APIRoute | null>(null)
  const [activeCategories, setActiveCategories] = useState<string[]>(["spbu", "kuliner", "bengkel", "spot_foto", "info_jalan"])
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null)
  const [estimate, setEstimate] = useState<{ bbm: number; tol: number; makan: number; total: number } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOrigin, setSearchOrigin] = useState(fromParam || "")
  const [searchDest, setSearchDest] = useState(toParam || "")
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleParam || "mobil")

  useEffect(() => {
    Promise.all([
      api.poi.list(),
      api.routes.list(),
    ]).then(([poiRes, routeRes]: any) => {
      setPois(poiRes?.data || [])
      setRoutes(routeRes?.data || [])
    }).catch(() => {})
  }, [])

  const vehicle = VEHICLES.find((v) => v.id === selectedVehicle) || VEHICLES[0]
  const filteredPOI = pois.filter((poi) => activeCategories.includes(poi.category))

  const handleSearchRoute = (origin: string, destination: string) => {
    const route = routes.find(
      (r) => r.origin.toLowerCase().includes(origin.toLowerCase()) && r.destination.toLowerCase().includes(destination.toLowerCase())
    ) || routes.find(
      (r) => r.origin.toLowerCase().includes(origin.toLowerCase()) || r.destination.toLowerCase().includes(destination.toLowerCase())
    )
    if (route) {
      setSelectedRoute(route)
      const fuelNeeded = Math.ceil(route.distance_km / vehicle.consumption)
      const fuelCost = fuelNeeded * FUEL_PRICE
      const tollCost = route.distance_km > 200 ? Math.round(route.distance_km * 600) : Math.round(route.distance_km * 400)
      const foodCost = Math.round(route.distance_km / 100) * 50000
      setEstimate({ bbm: fuelCost, tol: tollCost, makan: foodCost, total: fuelCost + tollCost + foodCost })
    }
  }

  useEffect(() => {
    if (fromParam && toParam) {
      setSearchOrigin(fromParam)
      setSearchDest(toParam)
      setSelectedVehicle(vehicleParam || "mobil")
    }
  }, [])

  useEffect(() => {
    if (searchOrigin && searchDest) handleSearchRoute(searchOrigin, searchDest)
  }, [selectedVehicle])

  return (
    <div className="relative flex h-[calc(100vh-4rem)]">
      <MapSidebar
        pois={filteredPOI}
        routes={routes as any}
        selectedRoute={selectedRoute as any}
        activeCategories={activeCategories}
        onCategoryToggle={(cat) => setActiveCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])}
        onSearchRoute={(origin, dest) => { setSearchOrigin(origin); setSearchDest(dest); handleSearchRoute(origin, dest) }}
        onSelectPOI={setSelectedPOI}
        estimate={estimate}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        searchOrigin={searchOrigin}
        searchDest={searchDest}
        selectedVehicle={selectedVehicle}
        onVehicleChange={setSelectedVehicle}
        vehicles={VEHICLES}
        onOriginChange={setSearchOrigin}
        onDestChange={setSearchDest}
      />
      <MapView pois={filteredPOI} selectedRoute={selectedRoute as any} selectedPOI={selectedPOI} onSelectPOI={setSelectedPOI} />
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="mt-4 text-sm text-muted-foreground">Memuat peta...</p></div></div>}>
      <MapContent />
    </Suspense>
  )
}
