/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { SPOT_CATEGORIES } from "@/data/spots"
import { SITE_NAME, SITE_URL } from "@/lib/constants"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { SpotCard } from "@/components/spot/SpotCard"
import { SpotHeroImage } from "@/components/spot/SpotHeroImage"
import { CopyPromptButton } from "@/components/spot/CopyPromptButton"

function cleanMapsUrl(url: string): string {
  if (!url) return url
  // Markdown link: [text](url) → extract url
  const md = url.match(/\]\(([^)]+)\)/)
  if (md) return md[1]
  // Already a plain URL
  if (url.startsWith("http")) return url
  return url
}
import { getSpots, getSpotBySlug, getSpotCoordinates } from "@/lib/services/spots"
import { getItinerariesBySpotSlug } from "@/lib/services/itineraries"
import type { SpotData } from "@/lib/services/spots"
import { NearbyPlaces } from "@/components/roadtrip/NearbyPlaces"

export async function generateStaticParams() {
  const { data: spots } = await getSpots({ limit: 100 })
  return spots.map((spot) => ({ slug: spot.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const spot = await getSpotBySlug(slug)
  if (!spot) return {}
  const metaDesc = spot.description || `${spot.name} — ${spot.category} di ${spot.province}. Temukan spot istimewa ini di ${SITE_NAME}.`
  return {
    title: `${spot.name} — Spot Istimewa — ${SITE_NAME}`,
    description: metaDesc,
    alternates: { canonical: `${SITE_URL}/spot-istimewa/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${spot.name} — ${SITE_NAME}`,
      description: metaDesc,
      url: `${SITE_URL}/spot-istimewa/${slug}`,
      type: "article",
      locale: "id_ID",
      images: spot.image_url
        ? [{ url: spot.image_url, width: 1200, height: 630 }]
        : [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${spot.name} — ${SITE_NAME}`,
      description: metaDesc,
      images: spot.image_url ? [spot.image_url] : undefined,
    },
  }
}

export default async function SpotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spot = await getSpotBySlug(slug)
  if (!spot) notFound()

  const cat = SPOT_CATEGORIES[spot.category as keyof typeof SPOT_CATEGORIES] || { icon: "📍", label: spot.category }

  const infoGrid = [
    { icon: "🕐", label: "Jam Buka", value: spot.opening_hours },
    { icon: "⏱️", label: "Estimasi Waktu", value: spot.visit_duration || spot.estimated_time },
    { icon: "💰", label: "Harga Tiket", value: spot.ticket_price },
    { icon: "🅿️", label: "Biaya Parkir", value: spot.parking_fee },
    { icon: "💸", label: "Biaya Tambahan", value: spot.additional_cost },
    { icon: "🏃", label: "Tingkat Fisik", value: spot.physical_effort },
    { icon: "🚗", label: "Akses Jalan", value: spot.road_access },
    { icon: "📏", label: "Jarak dari Kota", value: spot.distance_from_city },
  ].filter((i) => i.value)

  const { data: allSpots } = await getSpots({ limit: 100 })
  const relatedItineraries = await getItinerariesBySpotSlug(slug)

  const coords = getSpotCoordinates(spot)
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: spot.name,
    description: spot.description || "",
    image: spot.image_url,
    address: { "@type": "PostalAddress", addressRegion: spot.province, addressCountry: "ID" },
  }
  if (coords) {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <SpotHeroImage src={spot.image_url} alt={spot.name} />
        {spot.image_prompt && (
          <div className="absolute top-24 right-4 z-20">
            <CopyPromptButton prompt={spot.image_prompt} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12 w-full">
          <div className="mb-4">
            <Breadcrumb items={[{ label: "Spot Istimewa", href: "/spot-istimewa" }, { label: spot.name }]} light />
          </div>
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
                const nh = (spot as any).nearby_hotels_jsonb as Array<{name:string;distance?:string;price?:string;maps_url?:string;nearby_restaurants?:Array<{name:string;distance?:string;price?:string;maps_url?:string}>}>
                if (!nh || nh.length === 0) return null
                return (
                  <div>
                    <h3 className="text-lg font-bold font-heading flex items-center gap-2"><span>🏨</span><span>Hotel & Penginapan Terdekat</span></h3>
                    <div className="mt-3 space-y-3">
                      {nh.map((h, i) => (
                        <div key={i} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">{h.name}</p>
                              {h.distance && <p className="text-xs text-muted-foreground mt-0.5">📍 {h.distance}</p>}
                              {h.price && <p className="text-xs text-muted-foreground">💰 {h.price}</p>}
                            </div>
                            {h.maps_url && (
                              <a href={cleanMapsUrl(h.maps_url)} target="_blank" rel="noopener noreferrer"
                                className="shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5">📍 Petunjuk Arah</a>
                            )}
                          </div>
                          {h.nearby_restaurants && h.nearby_restaurants.length > 0 && (
                            <div className="mt-2 ml-3 border-l-2 border-blue-100 pl-3 space-y-1">
                              {h.nearby_restaurants.map((r, j) => (
                                <div key={j} className="flex items-start justify-between gap-2 text-xs text-blue-600">
                                  <span className="flex-1">🍜 {r.name}{r.distance ? ` (${r.distance})` : ''}{r.price ? ` — ${r.price}` : ''}</span>
                                  {r.maps_url && (
                                    <a href={cleanMapsUrl(r.maps_url)} target="_blank" rel="noopener noreferrer"
                                      className="shrink-0 text-blue-400 hover:text-blue-600">📍 Petunjuk Arah</a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {(() => {
                const nr = (spot as any).nearby_restaurants_jsonb as Array<{name:string;distance?:string;price?:string;maps_url?:string}>
                if (!nr || nr.length === 0) return null
                return (
                  <div>
                    <h3 className="text-lg font-bold font-heading flex items-center gap-2"><span>🍜</span><span>Kuliner Terdekat</span></h3>
                    <div className="mt-3 space-y-2">
                      {nr.map((r, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">📍 {r.distance}{r.price ? ` — ${r.price}` : ''}</p>
                          </div>
                          {r.maps_url && (
                            <a href={cleanMapsUrl(r.maps_url)} target="_blank" rel="noopener noreferrer"
                              className="shrink-0 text-xs text-orange-600 hover:text-orange-800 font-medium">📍 Petunjuk Arah</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {(spot as any).spot_important_note && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Catatan Penting Pengendara</p>
                    <p className="text-sm text-red-600 mt-1">{(spot as any).spot_important_note}</p>
                  </div>
                </div>
              )}

              {relatedItineraries.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2"><span>🏎️</span><span>Roadtrip Ini Termasuk Dalam</span></h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Spot ini bagian dari panduan roadtrip berikut:</p>
                  <div className="flex flex-col gap-3">
                    {relatedItineraries.map((it) => (
                      <Link key={it.id} href={`/roadtrip/${it.slug}`}
                        className="flex items-center gap-4 rounded-2xl border border-border/50 bg-white p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">🏎️</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold font-heading">{it.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{it.itineraryDuration} · {it.stops.length} destinasi</p>
                        </div>
                        <svg className="ml-auto w-5 h-5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const coords = getSpotCoordinates(spot)
                if (!coords) return null
                return (
                  <div>
                    <div className="border-t border-border/30 pt-8">
                      <NearbyPlaces
                        lat={coords.lat}
                        lng={coords.lng}
                        category="all"
                        radius={5000}
                        limit={6}
                      />
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
                  {spot.best_time || spot.best_visit_hour && (
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-lg">⏰</span>
                      <div><p className="text-xs text-muted-foreground">Waktu Terbaik</p><p className="text-sm font-medium">{spot.best_time || spot.best_visit_hour}</p></div>
                    </div>
                  )}
                  {spot.why_special && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary font-medium">✨ Kenapa Istimewa:</span> {spot.why_special}</p>
                    </div>
                  )}
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
