import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { SPOT_CATEGORIES } from "@/data/spots"
import { getPopularRoutes } from "@/data/popular-routes"
import { SITE_NAME } from "@/lib/constants"
import { SpotCard } from "@/components/spot/SpotCard"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

interface APISpot {
  slug: string
  name: string
  category: string
  province: string
  region: string
  description: string
  rating: number
  image_url: string
  image_credit: string
  tags: string[]
  tips: string
  best_time: string
  opening_hours: string
  estimated_time: string
  ticket_price: string
  road_access: string
  facilities: string[]
  distance_from_city: string
  why_special: string
  location: string
}

async function getSpot(slug: string): Promise<APISpot | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/spots/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch { return null }
}

async function getSpots(): Promise<APISpot[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/spots?limit=100`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data || []
  } catch { return [] }
}

export async function generateStaticParams() {
  const spots = await getSpots()
  return spots.map((spot) => ({ slug: spot.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const spot = await getSpot(slug)
  if (!spot) return {}
  return {
    title: `${spot.name} — Spot Istimewa — ${SITE_NAME}`,
    description: spot.description,
    openGraph: { title: `${spot.name} — ${SITE_NAME}`, description: spot.description, images: [{ url: spot.image_url, width: 800, height: 600 }] },
  }
}

export default async function SpotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spot = await getSpot(slug)
  if (!spot) notFound()

  const cat = SPOT_CATEGORIES[spot.category as keyof typeof SPOT_CATEGORIES] || { icon: "📍", label: spot.category }

  const infoGrid = [
    { icon: "🕐", label: "Jam Buka", value: spot.opening_hours },
    { icon: "⏱️", label: "Estimasi Waktu", value: spot.estimated_time },
    { icon: "💰", label: "Harga Tiket", value: spot.ticket_price },
    { icon: "🚗", label: "Akses Jalan", value: spot.road_access },
    { icon: "📏", label: "Jarak dari Kota", value: spot.distance_from_city },
  ].filter((i) => i.value)

  const allSpots = await getSpots()

  return (
    <>
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <Image src={spot.image_url || "/placeholder.svg"} alt={spot.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12 w-full">
          <Link href="/spot-istimewa" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Kembali ke Spot Istimewa
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white"><span>{cat.icon}</span><span>{cat.label}</span></span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">📍 {spot.province}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white leading-tight">{spot.name}</h1>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-heading">Tentang Tempat Ini</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed text-lg">{spot.description}</p>
              </div>
              {infoGrid.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {infoGrid.map((info) => (
                    <div key={info.label} className="rounded-2xl border border-border/50 p-5">
                      <h4 className="text-sm font-semibold font-heading flex items-center gap-2"><span>{info.icon}</span><span>{info.label}</span></h4>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{info.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {spot.facilities?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2"><span>🏪</span><span>Fasilitas</span></h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {spot.facilities.map((f: string) => (
                      <span key={f} className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1.5 text-sm font-medium text-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {(() => {
                const routes = getPopularRoutes({ province: spot.province, name: spot.name } as any)
                if (!routes.length) return null
                return (
                  <div>
                    <h3 className="text-lg font-bold font-heading flex items-center gap-2"><span>🚗</span><span>Rute Populer ke {spot.name}</span></h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Pilih kota asal kamu dan langsung rencanakan perjalanan.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {routes.map((r: any) => (
                        <Link key={r.from} href={`/map?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&vehicle=mobil`}
                          className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-white p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg transition-transform duration-300 group-hover:scale-110">🚗</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold font-heading">{r.from}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>⏱️ {r.duration}</span><span>→</span><span className="truncate">{r.to}</span>
                            </div>
                          </div>
                          <svg className="ml-auto w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })()}
              {spot.tips && (
                <div className="rounded-2xl bg-gradient-to-br from-primary/[0.05] to-accent/[0.05] border border-border/50 p-6">
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2"><span>💡</span><span>Tips</span></h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{spot.tips}</p>
                </div>
              )}
              {spot.tags?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold font-heading">Tags</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {spot.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border/50 p-6 sticky top-24">
                <h3 className="text-sm font-semibold font-heading text-muted-foreground uppercase tracking-wider">Info Singkat</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">📌</span>
                    <div><p className="text-xs text-muted-foreground">Kategori</p><p className="text-sm font-medium">{cat.label}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-lg">📍</span>
                    <div><p className="text-xs text-muted-foreground">Provinsi</p><p className="text-sm font-medium">{spot.province}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-lg">⭐</span>
                    <div><p className="text-xs text-muted-foreground">Rating Roadtripper</p><p className="text-sm font-medium">{spot.rating} / 5.0</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg">🗺️</span>
                    <div><p className="text-xs text-muted-foreground">Region</p><p className="text-sm font-medium">{spot.region}</p></div>
                  </div>
                  {spot.best_time && (
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-lg">⏰</span>
                      <div><p className="text-xs text-muted-foreground">Waktu Terbaik</p><p className="text-sm font-medium">{spot.best_time}</p></div>
                    </div>
                  )}
                  {spot.why_special && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary font-medium">✨ Kenapa Istimewa:</span> {spot.why_special}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  {(() => {
                    const routes = getPopularRoutes({ province: spot.province, name: spot.name } as any)
                    const firstRoute = routes[0]
                    return (
                      <>
                        {firstRoute && (
                          <Link href={`/map?from=${encodeURIComponent(firstRoute.from)}&to=${encodeURIComponent(firstRoute.to)}&vehicle=mobil`}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground px-4 py-3 text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:-translate-y-0.5"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Rencanakan Rute dari {firstRoute.from}
                          </Link>
                        )}
                        <Link href={`/map?from=&to=${encodeURIComponent(spot.name)}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:border-primary/30"
                        >Atur asal manual →</Link>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(() => {
        const nearby = allSpots.filter((s) => s.province === spot.province && s.slug !== spot.slug).slice(0, 3)
        if (nearby.length === 0) return null
        return (
          <section className="pb-16 sm:pb-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className="border-t border-border/30 pt-10">
                <h2 className="text-2xl font-bold font-heading mb-2">Spot Lain di {spot.province}</h2>
                <p className="text-sm text-muted-foreground mb-8">Temukan tempat menarik lainnya di provinsi yang sama.</p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {nearby.map((s) => (
                    <SpotCard key={s.slug} spot={s} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })()}
    </>
  )
}
