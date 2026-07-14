/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SITE_NAME, SITE_URL } from "@/lib/constants"
import { getSpots, getSpotBySlug, getSpotCoordinates } from "@/lib/services/spots"
import { getItinerariesBySpotSlug } from "@/lib/services/itineraries"
import { SpotDetailClient } from "@/components/spot/SpotDetailClient"

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
    title: `${spot.name} — Spot Istimewa`,
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
  if (spot.is_published === false) notFound()

  const relatedItineraries = await getItinerariesBySpotSlug(slug)
  const { data: allSpots } = await getSpots({ limit: 100 })

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
      <SpotDetailClient spot={spot} relatedItineraries={relatedItineraries} allSpots={allSpots} />
    </>
  )
}
