import { serverSupabase } from "./supabase"
import type { Spot } from "@/types"

export async function getAllSpots() {
  const { data, error } = await serverSupabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Spot[]
}

export async function getSpotBySlug(slug: string) {
  const { data, error } = await serverSupabase
    .from("spots")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) throw error
  return data as Spot
}

export async function createSpot(spot: Partial<Spot>) {
  const { data, error } = await serverSupabase
    .from("spots")
    .insert([spot])
    .select()
    .single()

  if (error) throw error
  return data as Spot
}

export async function updateSpot(slug: string, spot: Partial<Spot>) {
  const { data, error } = await serverSupabase
    .from("spots")
    .update(spot)
    .eq("slug", slug)
    .select()
    .single()

  if (error) throw error
  return data as Spot
}

export async function deleteSpot(slug: string) {
  const { error } = await serverSupabase
    .from("spots")
    .delete()
    .eq("slug", slug)

  if (error) throw error
}

export async function getAllSlugs() {
  const { data, error } = await serverSupabase
    .from("spots")
    .select("slug")

  if (error) throw error
  return data.map((s: { slug: string }) => ({ slug: s.slug }))
}

export async function incrementViewCount(slug: string) {
  await serverSupabase.rpc("increment_view_count", { slug_param: slug })
}
