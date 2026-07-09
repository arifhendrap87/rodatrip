import { success, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

interface ReadinessItem {
  slug: string
  title: string
  type: "blog" | "spot" | "roadtrip"
  score: number
  checks: { label: string; ok: boolean }[]
  previewUrl?: string
  isPublished: boolean
}

function calcScore(checks: { ok: boolean }[]): number {
  if (checks.length === 0) return 0
  return Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
}

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const items: ReadinessItem[] = []

  // Fetch blogs
  const { data: blogs } = await db.from("blog_posts").select("*").order("updated_at", { ascending: false }).limit(50)
  if (blogs) {
    for (const b of blogs) {
      const checks = [
        { label: "Judul", ok: !!b.title },
        { label: "Konten", ok: !!b.content },
        { label: "Gambar", ok: !!b.image_url },
        { label: "SEO Title", ok: !!b.seo_title },
        { label: "Meta Description", ok: !!b.meta_description },
        { label: "Tags", ok: ((b.tags || []) as string[]).length > 0 },
        { label: "Kategori", ok: !!b.category },
        { label: "Publikasi", ok: !!b.is_published },
      ]
      items.push({
        slug: b.slug,
        title: b.title,
        type: "blog",
        score: calcScore(checks),
        checks,
        previewUrl: `/admin/blog/preview/${b.slug}`,
        isPublished: !!b.is_published,
      })
    }
  }

  // Fetch spots
  const { data: spots } = await db.from("spots").select("*").order("updated_at", { ascending: false }).limit(50)
  if (spots) {
    for (const s of spots) {
      const loc = s.location as { coordinates?: number[] } | null
      const latLngValid = !!loc?.coordinates && loc.coordinates[0] !== 0 && loc.coordinates[1] !== 0
      const checks = [
        { label: "Nama", ok: !!s.name },
        { label: "Deskripsi", ok: !!s.description },
        { label: "Gambar", ok: !!s.image_url },
        { label: "Kategori", ok: !!s.category },
        { label: "Provinsi", ok: !!s.province },
        { label: "Koordinat", ok: latLngValid },
        { label: "Rating", ok: (s.rating as number) > 0 },
      ]
      items.push({
        slug: s.slug,
        title: s.name,
        type: "spot",
        score: calcScore(checks),
        checks,
        previewUrl: `/spot-istimewa/${s.slug}`,
        isPublished: true,
      })
    }
  }

  // Fetch itineraries
  const { data: roadtrips } = await db.from("itineraries").select("*").order("updated_at", { ascending: false }).limit(50)
  if (roadtrips) {
    for (const r of roadtrips) {
      const checks = [
        { label: "Judul", ok: !!r.title },
        { label: "Cover Image", ok: !!r.cover_image },
        { label: "Durasi", ok: !!r.itinerary_duration },
        { label: "Stops", ok: (r as any).stops != null },
        { label: "Kondisi Jalan", ok: !!r.road_condition },
        { label: "Publikasi", ok: !!r.is_published },
      ]
      items.push({
        slug: r.slug,
        title: r.title,
        type: "roadtrip",
        score: calcScore(checks),
        checks,
        previewUrl: `/roadtrip/${r.slug}`,
        isPublished: !!r.is_published,
      })
    }
  }

  return success(items)
}
