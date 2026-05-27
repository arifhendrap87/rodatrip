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
  const { data, error } = await db
    .from("routes")
    .select("*")
    .order("name")

  if (error) throw error
  return (data || []) as RouteData[]
}

export async function getRouteBySlug(slug: string): Promise<RouteData | null> {
  const { data, error } = await db
    .from("routes")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as RouteData
}
