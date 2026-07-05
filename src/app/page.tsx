import { Hero } from "@/components/landing/Hero"
import { LandingMap } from "@/components/landing/LandingMap"
import { Testimonials } from "@/components/landing/Testimonials"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturedSpots } from "@/components/landing/FeaturedSpots"
import { BlogSection } from "@/components/landing/BlogSection"

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LandingMap />

      <div className="bg-[#FDFBF7]">
        <Testimonials />
      </div>

      <div className="bg-[#F0EDE8]">
        <FeaturedSpots />
      </div>

      <div className="bg-[#FDFBF7]">
        <BlogSection />
      </div>

      <div className="bg-[#F0EDE8]">
        <HowItWorks />
      </div>
    </>
  )
}
