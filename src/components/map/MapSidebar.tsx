"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { POI_CATEGORIES, POPULAR_ROUTES, FUEL_PRICE } from "@/lib/constants"
import type { POI, Route, TripEstimate } from "@/types"

interface Vehicle {
  id: string
  label: string
  consumption: number
}

interface MapSidebarProps {
  pois: POI[]
  routes: Route[]
  selectedRoute: Route | null
  activeCategories: string[]
  onCategoryToggle: (category: string) => void
  onSearchRoute: (origin: string, destination: string) => void
  onSelectPOI: (poi: POI | null) => void
  estimate: TripEstimate | null
  open: boolean
  onToggle: () => void
  searchOrigin: string
  searchDest: string
  selectedVehicle: string
  onVehicleChange: (v: string) => void
  vehicles: readonly Vehicle[]
  onOriginChange: (v: string) => void
  onDestChange: (v: string) => void
}

export function MapSidebar({
  pois,
  routes,
  selectedRoute,
  activeCategories,
  onCategoryToggle,
  onSearchRoute,
  onSelectPOI,
  estimate,
  open,
  onToggle,
  searchOrigin,
  searchDest,
  selectedVehicle,
  onVehicleChange,
  vehicles,
  onOriginChange,
  onDestChange,
}: MapSidebarProps) {
  const [searchPOI, setSearchPOI] = useState("")

  const filteredPOIList = pois.filter(
    (poi) =>
      poi.name.toLowerCase().includes(searchPOI.toLowerCase()) ||
      poi.address.toLowerCase().includes(searchPOI.toLowerCase())
  )

  const getCategoryIcon = (cat: string) =>
    POI_CATEGORIES.find((c) => c.value === cat)?.icon || "📍"

  const getCategoryColor = (cat: string) =>
    POI_CATEGORIES.find((c) => c.value === cat)?.color || ""

  const handleRouteClick = (origin: string, destination: string) => {
    onOriginChange(origin)
    onDestChange(destination)
    onSearchRoute(origin, destination)
  }

  const vehicle = vehicles.find((v) => v.id === selectedVehicle) || vehicles[0]
  const fuelPerLiter = FUEL_PRICE

  return (
    <>
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-10 md:hidden flex items-center gap-2 rounded-xl bg-white border border-border/50 px-3 py-2 shadow-sm text-sm font-medium"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
        Panel
      </button>

      <div
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-20 md:z-auto left-0 top-16 bottom-0 w-full sm:w-96 bg-white border-r border-border/50 overflow-y-auto transition-transform duration-300`}
      >
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold font-heading">Cari Rute</h2>
            <div className="mt-3 space-y-2">
              <Input
                placeholder="Kota asal"
                value={searchOrigin}
                onChange={(e) => onOriginChange(e.target.value)}
                list="origin-list"
                className="h-10 bg-muted/50 border-border/50 rounded-xl"
              />
              <datalist id="origin-list">
                {POPULAR_ROUTES.map((r) => (
                  <option key={r.origin} value={r.origin} />
                ))}
              </datalist>
              <Input
                placeholder="Kota tujuan"
                value={searchDest}
                onChange={(e) => onDestChange(e.target.value)}
                list="dest-list"
                className="h-10 bg-muted/50 border-border/50 rounded-xl"
              />
              <datalist id="dest-list">
                {POPULAR_ROUTES.map((r) => (
                  <option key={r.destination} value={r.destination} />
                ))}
              </datalist>
              <select
                value={selectedVehicle}
                onChange={(e) => onVehicleChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-border/50 bg-muted/50 px-3 text-sm"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <Button
                onClick={() => onSearchRoute(searchOrigin, searchDest)}
                size="sm"
                className="w-full rounded-xl"
              >
                Cari Rute
              </Button>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">Rute populer:</p>
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleRouteClick(r.origin, r.destination)}
                  className="block w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  → {r.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold font-heading mb-3">Filter POI</h3>
            <div className="flex flex-wrap gap-2">
              {POI_CATEGORIES.map((cat) => {
                const active = activeCategories.includes(cat.value)
                return (
                  <button
                    key={cat.value}
                    onClick={() => onCategoryToggle(cat.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedRoute && estimate && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold font-heading mb-3">
                  {selectedRoute.origin} → {selectedRoute.destination}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">Jarak</span>
                    <span className="text-sm font-medium">{selectedRoute.distance_km} km</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">BBM</span>
                      <span className="text-xs text-muted-foreground/60">({vehicle.label.replace(/[🏍️🚗🚙🚐]/g, "").trim()})</span>
                    </div>
                    <span className="text-sm font-medium">Rp {estimate.bbm.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">Tol</span>
                    <span className="text-sm font-medium">Rp {estimate.tol.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">Makan</span>
                    <span className="text-sm font-medium">Rp {estimate.makan.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    <span className="text-sm font-semibold font-heading">Estimasi Total</span>
                    <span className="text-sm font-bold font-heading text-primary">
                      Rp {(estimate.bbm + estimate.tol + estimate.makan).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold font-heading">POI di Rute</h3>
              <Badge variant="outline" className="text-xs">{filteredPOIList.length}</Badge>
            </div>
            <Input
              placeholder="Cari POI..."
              value={searchPOI}
              onChange={(e) => setSearchPOI(e.target.value)}
              className="h-9 bg-muted/50 border-border/50 rounded-xl mb-3 text-sm"
            />
            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
              {filteredPOIList.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => onSelectPOI(poi)}
                  className="w-full text-left rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 ${getCategoryColor(poi.category)}`}>
                      {getCategoryIcon(poi.category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{poi.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{poi.address}</p>
                      {poi.rating > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">★ {poi.rating.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {filteredPOIList.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada POI dengan filter ini
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
