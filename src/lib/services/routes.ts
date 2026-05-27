import { db } from "./db"

export interface RouteData {
  id: string
  slug: string
  name: string
  origin: string
  destination: string
  distance_km: number
  duration_hours: number
  polyline: [number, number][]
  created_at: string
  updated_at: string
}

export async function getRoutes(): Promise<RouteData[]> {
  try {
    const { data, error } = await db
      .from("routes")
      .select("*")
      .order("name")

    if (error) return []
    return (data || []) as RouteData[]
  } catch {
    return []
  }
}

export async function getRouteBySlug(slug: string): Promise<RouteData | null> {
  try {
    const { data, error } = await db
      .from("routes")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error) return null
    return data as RouteData
  } catch {
    return null
  }
}
