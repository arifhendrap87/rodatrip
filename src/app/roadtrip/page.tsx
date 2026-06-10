import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/constants"
import { getItineraries } from "@/lib/services/itineraries"

export const metadata: Metadata = {
  title: `Roadtrip — ${SITE_NAME}`,
  description: "Panduan roadtrip kurasi untuk menjelajahi Indonesia. Dari hidden gems sampai ikon legendaris, lengkap dengan timeline itinerary.",
  openGraph: {
    title: `Roadtrip — ${SITE_NAME}`,
    description: "Panduan roadtrip kurasi untuk menjelajahi Indonesia.",
  },
}

export default async function RoadtripListPage() {
  const itineraries = await getItineraries({ published: true })

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-20 sm:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              🏎️ Roadtrip Kurasi
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold font-heading tracking-tight leading-tight">
              Panduan{" "}
              <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
                Roadtrip
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Kumpulan rute roadtrip kurasi lengkap dengan itinerary, estimasi biaya, dan tips perjalanan. Siap-siap gas!
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {itineraries.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl">🏎️</span>
              <p className="mt-4 text-lg font-medium text-foreground">Belum ada panduan roadtrip</p>
              <p className="mt-1 text-sm text-muted-foreground">Panduan roadtrip kurasi akan segera hadir.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {itineraries.map((itinerary) => (
                <Link
                  key={itinerary.id}
                  href={`/roadtrip/${itinerary.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-border/50">
                    {itinerary.coverImage ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={itinerary.coverImage}
                          alt={itinerary.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">
                            {itinerary.itineraryDuration || "Roadtrip"}
                          </span>
                          {itinerary.totalDistance && (
                            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm">
                              {itinerary.totalDistance}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-6">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">🏎️</span>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground font-heading">{itinerary.itineraryDuration || "Roadtrip"}</p>
                          {itinerary.totalDistance && <p>{itinerary.totalDistance}</p>}
                        </div>
                      </div>
                    )}

                    <div className="p-6 pt-4">
                      <h3 className="text-lg font-bold font-heading leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {itinerary.title}
                      </h3>

                      {itinerary.roadCondition && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          🛣️ {itinerary.roadCondition}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span>📍</span>
                          <span>{itinerary.stops.length} destinasi</span>
                        </span>
                        {itinerary.estimatedCost && (
                          <span className="inline-flex items-center gap-1">
                            <span>💰</span>
                            <span className="truncate max-w-[140px]">{itinerary.estimatedCost}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
