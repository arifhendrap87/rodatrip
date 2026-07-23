import type { MetadataRoute } from "next"
import { getSpots } from "@/lib/services/spots"
import { getRoutes } from "@/lib/services/routes"
import { getPosts } from "@/lib/services/blog"
import { getItineraries } from "@/lib/services/itineraries"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rodatrip.id"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [spotsRes, routes, blog, itineraries] = await Promise.all([
    getSpots({ limit: 100 }),
    getRoutes().catch(() => []),
    getPosts().catch(() => []),
    getItineraries({ published: true }).catch(() => []),
  ])

  const { data: spots } = spotsRes

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1.0 },
    { url: `${BASE_URL}/spot-istimewa`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/map`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/roadtrip`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/waitlist/thanks`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.1 },
  ]

  const routePages = (routes || []).map((route) => ({
    url: `${BASE_URL}/rute/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const spotPages = (spots || []).map((spot) => ({
    url: `${BASE_URL}/spot-istimewa/${spot.slug}`,
    lastModified: new Date(spot.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  const blogPages = (blog || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.published_at || post.updated_at || new Date()),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const roadtripPages = (itineraries || []).map((itin) => ({
    url: `${BASE_URL}/roadtrip/${itin.slug}`,
    lastModified: new Date(itin.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...routePages, ...spotPages, ...blogPages, ...roadtripPages]
}
