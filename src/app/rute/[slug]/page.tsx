import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SITE_NAME } from "@/lib/constants"
import { RouteDetailClient } from "./client"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

interface APIRoute {
  id: string
  name: string
  slug: string
  origin: string
  destination: string
  distance_km: number
  duration_hours: number
  polyline: [number, number][]
}

async function getRoute(slug: string): Promise<APIRoute | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/routes/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch { return null }
}

async function getRoutes(): Promise<APIRoute[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/routes`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data || []
  } catch { return [] }
}

export async function generateStaticParams() {
  const routes = await getRoutes()
  return routes.map((route) => ({ slug: route.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const route = await getRoute(slug)
  if (!route) return { title: "Rute Tidak Ditemukan" }
  return {
    title: `${route.origin} → ${route.destination} — Rute Roadtrip ${SITE_NAME}`,
    description: `Rute ${route.origin} ke ${route.destination} lengkap dengan POI, info jalan, dan estimasi biaya. ${route.distance_km} km perjalanan.`,
    openGraph: { title: `${route.origin} → ${route.destination} - Rute`, description: `Rute ${route.origin} ke ${route.destination}: ${route.distance_km} km dengan POI menarik di sepanjang jalan.`, locale: "id_ID", type: "article" },
  }
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const route = await getRoute(slug)
  if (!route) notFound()

  const fuelCost = Math.round(route.distance_km * 12500 / 11)
  const tollCost = route.distance_km > 200 ? Math.round(route.distance_km * 600) : Math.round(route.distance_km * 400)
  const foodCost = Math.round(route.distance_km / 100) * 50000
  const totalCost = fuelCost + tollCost + foodCost

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">{route.origin} → {route.destination}</h1>
            <p className="mt-2 text-lg text-muted-foreground">Rute sejauh {route.distance_km} km dengan POI menarik di sepanjang jalan.</p>
            <div className="mt-6 hidden lg:flex gap-8 py-4 border-y border-border/50">
              <div><p className="text-2xl font-bold font-heading text-primary">{route.distance_km}</p><p className="text-xs text-muted-foreground">Kilometer</p></div>
              <div><p className="text-2xl font-bold font-heading text-secondary">{Math.round(route.distance_km / 60)}</p><p className="text-xs text-muted-foreground">Jam perjalanan</p></div>
              <div><p className="text-2xl font-bold font-heading text-accent">-</p><p className="text-xs text-muted-foreground">POI</p></div>
              <div><p className="text-2xl font-bold font-heading">Rp {(totalCost / 1000).toFixed(0)}k</p><p className="text-xs text-muted-foreground">Estimasi biaya</p></div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <a href={`https://maps.google.com/?dirflg=d&saddr=${route.polyline[0][0]},${route.polyline[0][1]}&daddr=${route.polyline[route.polyline.length - 1][0]},${route.polyline[route.polyline.length - 1][1]}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-white px-6 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>

      <RouteDetailClient
        route={route}
        pois={[]}
        products={[]}
        costBreakdown={{ bbm: fuelCost, tol: tollCost, makan: foodCost, total: totalCost }}
        poisByCategory={{ spbu: [], kuliner: [], bengkel: [], spot: [], info: [] }}
      />
    </div>
  )
}
