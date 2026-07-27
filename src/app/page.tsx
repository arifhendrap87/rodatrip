import { getItineraries } from "@/lib/services/itineraries"
import { getSpots } from "@/lib/services/spots"
import { getPosts } from "@/lib/services/blog"
import { db } from "@/lib/services/db"
import { Hero } from "@/components/landing/Hero"
import { LandingMap } from "@/components/landing/LandingMap"
import { SectionDivider } from "@/components/ui/SectionDivider"
import { FeaturedSpots } from "@/components/landing/FeaturedSpots"
import { FeaturedRoadtrips } from "@/components/landing/FeaturedRoadtrips"
import { BlogSection } from "@/components/landing/BlogSection"
import { MusicPlayer } from "@/components/landing/MusicPlayer"

export default async function LandingPage() {
  const [itineraries, featuredSpots, blogPosts] = await Promise.all([
    getItineraries({ published: true, limit: 6 }),
    getSpots({ published: true, limit: 8 }),
    getPosts({ limit: 6 }),
  ])

  const totalSpotsResult = await db
    .from("spots")
    .select("id", { count: "exact", head: true })

  const stats = {
    roadtrips: itineraries.length,
    spots: totalSpotsResult.count || featuredSpots.data.length,
  }

  const mapSpots = featuredSpots.data.map((s) => ({
    slug: s.slug,
    name: s.name,
    lat: (s as any).location?.coordinates?.[1] || 0,
    lng: (s as any).location?.coordinates?.[0] || 0,
    category: s.category,
    province: s.province,
  })).filter((s) => s.lat !== 0 && s.lng !== 0)

  return (
    <>
      <Hero initialStats={stats} />
      <LandingMap spots={mapSpots} />
      <div className="bg-[#FDFBF7]">
        <FeaturedRoadtrips roadtrips={itineraries} />
      </div>
      <SectionDivider />
      <div className="bg-[#F0EDE8]">
        <FeaturedSpots spots={featuredSpots.data} />
      </div>
      <div className="bg-[#FDFBF7]">
        <BlogSection posts={blogPosts} />
      </div>
      <MusicPlayer />
    </>
  )
}
