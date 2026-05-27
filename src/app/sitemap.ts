import type { MetadataRoute } from "next"
import { SITE_NAME } from "@/lib/constants"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gaskuy.id"

async function fetchAPI(path: string) {
  try {
    const res = await fetch(`${BASE_URL}/api${path}`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data || []
  } catch { return [] }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [spots, routes, blog] = await Promise.all([
    fetchAPI("/spots?limit=100"),
    fetchAPI("/routes"),
    fetchAPI("/blog"),
  ])

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1.0 },
    { url: `${BASE_URL}/spot-istimewa`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/map`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  ]

  const routePages = (routes as any[]).map((route) => ({
    url: `${BASE_URL}/rute/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const spotPages = (spots as any[]).map((spot) => ({
    url: `${BASE_URL}/spot-istimewa/${spot.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  const blogPages = (blog as any[]).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...routePages, ...spotPages, ...blogPages]
}
