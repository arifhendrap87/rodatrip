import { Hero } from "@/components/landing/Hero"
import { LandingMap } from "@/components/landing/LandingMap"
import { Testimonials } from "@/components/landing/Testimonials"
import { FeaturedSpots } from "@/components/landing/FeaturedSpots"
import { FeaturedRoadtrips } from "@/components/landing/FeaturedRoadtrips"
import { BlogSection } from "@/components/landing/BlogSection"
import { MusicPlayer } from "@/components/landing/MusicPlayer"

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LandingMap />

      <div className="bg-[#FDFBF7]">
        <FeaturedRoadtrips />
      </div>

      <div className="bg-[#F0EDE8]">
        <FeaturedSpots />
      </div>

      <div className="bg-[#F0EDE8]">
        <BlogSection />
      </div>

      <div className="bg-[#FDFBF7]">
        <Testimonials />
      </div>

      <MusicPlayer />
    </>
  )
}
