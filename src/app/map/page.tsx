"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { MapSidebar } from "@/components/map/MapSidebar"
import type { POI, Route, TripEstimate } from "@/types"
import { mockPOI } from "@/lib/mock/poi"
import { mockRoutes } from "@/lib/mock/routes"
import { VEHICLES, FUEL_PRICE } from "@/lib/constants"

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
})

function MapContent() {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const vehicleParam = searchParams.get("vehicle")

  const [pois] = useState<POI[]>(mockPOI)
  const [routes] = useState<Route[]>(mockRoutes)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [activeCategories, setActiveCategories] = useState<string[]>([
    "spbu", "kuliner", "bengkel", "spot_foto", "info_jalan",
  ])
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null)
  const [estimate, setEstimate] = useState<TripEstimate | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOrigin, setSearchOrigin] = useState(fromParam || "")
  const [searchDest, setSearchDest] = useState(toParam || "")
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleParam || "mobil")

  const vehicle = VEHICLES.find((v) => v.id === selectedVehicle) || VEHICLES[0]

  const filteredPOI = pois.filter((poi) => activeCategories.includes(poi.category))

  const handleSearchRoute = (origin: string, destination: string) => {
    const route = routes.find(
      (r) =>
        r.origin.toLowerCase().includes(origin.toLowerCase()) &&
        r.destination.toLowerCase().includes(destination.toLowerCase())
    ) || routes.find(
      (r) =>
        r.origin.toLowerCase().includes(origin.toLowerCase()) ||
        r.destination.toLowerCase().includes(destination.toLowerCase())
    )
    if (route) {
      setSelectedRoute(route)
      const fuelNeeded = Math.ceil(route.distance_km / vehicle.consumption)
      const fuelCost = fuelNeeded * FUEL_PRICE
      const tollCost = route.distance_km > 200 ? Math.round(route.distance_km * 600) : Math.round(route.distance_km * 400)
      const foodCost = Math.round(route.distance_km / 100) * 50000
      setEstimate({
        bbm: fuelCost,
        tol: tollCost,
        makan: foodCost,
        total: fuelCost + tollCost + foodCost,
      })
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
    if (searchOrigin && searchDest) {
      handleSearchRoute(searchOrigin, searchDest)
    }
  }, [selectedVehicle])

  return (
    <div className="relative flex h-[calc(100vh-4rem)]">
      <MapSidebar
        pois={filteredPOI}
        routes={routes}
        selectedRoute={selectedRoute}
        activeCategories={activeCategories}
        onCategoryToggle={(cat) => {
          setActiveCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
          )
        }}
        onSearchRoute={(origin, dest) => {
          setSearchOrigin(origin)
          setSearchDest(dest)
          handleSearchRoute(origin, dest)
        }}
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
      <MapView
        pois={filteredPOI}
        selectedRoute={selectedRoute}
        selectedPOI={selectedPOI}
        onSelectPOI={setSelectedPOI}
      />
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    }>
      <MapContent />
    </Suspense>
  )
}
