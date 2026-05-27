"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { POI_CATEGORIES } from "@/lib/constants"
import type { Route, POI, Product, TripEstimate } from "@/types"

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false })

interface RouteDetailClientProps {
  route: Route
  pois: POI[]
  products: Product[]
  costBreakdown: TripEstimate
  poisByCategory: Record<string, POI[]>
}

const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
  spbu: { label: "SPBU", icon: "⛽", color: "text-secondary" },
  kuliner: { label: "Kuliner", icon: "🍜", color: "text-orange-500" },
  bengkel: { label: "Bengkel", icon: "🔧", color: "text-gray-500" },
  spot: { label: "Spot Foto", icon: "📸", color: "text-accent" },
  info: { label: "Info Jalan", icon: "⚠️", color: "text-red-500" },
}

export function RouteDetailClient({
  route,
  pois,
  products,
  costBreakdown,
  poisByCategory,
}: RouteDetailClientProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `${route.origin} → ${route.destination}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <section className="h-[50vh] sm:h-[60vh] w-full">
        <RouteMap route={route} pois={pois} />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/map" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Kembali ke peta
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
            {copied ? "Link disalin!" : "Bagikan rute"}
          </button>
        </div>

        {poisByCategory.info && poisByCategory.info.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-600">⚠️ Info Kondisi Jalan</p>
            {poisByCategory.info.map((i: POI) => (
              <p key={i.id} className="text-sm text-red-500 mt-1">{i.description}</p>
            ))}
          </div>
        )}

        <section>
          <h2 className="text-2xl font-bold font-heading mb-6">POI Sepanjang Rute</h2>
          <div className="space-y-8">
            {Object.entries(poisByCategory).map(([cat, catPois]) => {
              if (cat === "info" || catPois.length === 0) return null
              const info = categoryLabels[cat] || { label: cat, icon: "📍", color: "text-gray-500" }
              return (
                <div key={cat}>
                  <div className={`flex items-center gap-2 mb-3 ${info.color}`}>
                    <span className="text-lg">{info.icon}</span>
                    <h3 className="font-semibold font-heading">{info.label}</h3>
                    <Badge variant="outline" className="text-xs">{(catPois as POI[]).length}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(catPois as POI[]).map((poi) => (
                      <Card key={poi.id} className="border-border/40 bg-white/60 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <p className="font-medium text-sm">{poi.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{poi.address}</p>
                          {poi.rating > 0 && (
                            <p className="text-xs text-yellow-500 mt-1">★ {poi.rating.toFixed(1)}</p>
                          )}
                          {poi.description && (
                            <p className="text-xs text-muted-foreground mt-1.5">{poi.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-6">Estimasi Biaya</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/40 bg-white/60 p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">BBM</p>
              <p className="text-xl font-bold font-heading mt-1">Rp {costBreakdown.bbm.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-white/60 p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Tol</p>
              <p className="text-xl font-bold font-heading mt-1">Rp {costBreakdown.tol.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-white/60 p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Makan</p>
              <p className="text-xl font-bold font-heading mt-1">Rp {costBreakdown.makan.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold font-heading text-primary mt-1">Rp {costBreakdown.total.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-6">Rekomendasi Aksesori untuk Rute Ini</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-thin">
            {products.map((product) => (
              <Card key={product.id} className="min-w-[220px] snap-start border-border/40 bg-white/60 shadow-sm shrink-0 hover:shadow-md transition-shadow">
                <div className="aspect-video w-full rounded-t-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-4xl opacity-30">🎒</span>
                </div>
                <CardContent className="p-4">
                  <p className="font-medium text-sm font-heading">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold font-heading">Rp {product.price.toLocaleString()}</span>
                    <Button size="sm" className="rounded-xl text-xs">+ Keranjang</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
