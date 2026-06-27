import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SITE_NAME, SITE_URL } from "@/lib/constants"
import { getItineraryBySlug } from "@/lib/services/itineraries"
import { RoadtripDetailClient } from "./client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const itinerary = await getItineraryBySlug(slug)
  if (!itinerary) return { title: "Roadtrip Tidak Ditemukan" }

  return {
    title: `${itinerary.title} — Roadtrip ${SITE_NAME}`,
    description: `Panduan roadtrip ${itinerary.title}: ${itinerary.itineraryDuration}, ${itinerary.totalDistance}, ${itinerary.roadCondition || "cek detail rute"}.`,
    openGraph: {
      title: `${itinerary.title} — ${SITE_NAME}`,
      description: `Panduan roadtrip ${itinerary.title}: ${itinerary.itineraryDuration}`,
      locale: "id_ID",
      type: "article",
      url: `${SITE_URL}/roadtrip/${slug}`,
      images: itinerary.coverImage ? [{ url: itinerary.coverImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${itinerary.title} — ${SITE_NAME}`,
      description: `Panduan roadtrip ${itinerary.title}: ${itinerary.itineraryDuration}`,
      images: itinerary.coverImage ? [itinerary.coverImage] : undefined,
    },
  }
}

export default async function RoadtripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const itinerary = await getItineraryBySlug(slug)
  if (!itinerary) notFound()

  return <RoadtripDetailClient itinerary={itinerary} />
}
