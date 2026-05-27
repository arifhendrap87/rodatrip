import type { MetadataRoute } from "next"
import { mockRoutes } from "@/lib/mock/routes"
import { spots } from "@/data/spots"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: "https://gaskuy.id", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1.0 },
    { url: "https://gaskuy.id/spot-istimewa", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: "https://gaskuy.id/map", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://gaskuy.id/products", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ]

  const routePages = mockRoutes.map((route) => ({
    url: `https://gaskuy.id/rute/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const spotPages = spots.map((spot) => ({
    url: `https://gaskuy.id/spot-istimewa/${spot.slug}`,
    lastModified: spot.addedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...routePages, ...spotPages]
}
