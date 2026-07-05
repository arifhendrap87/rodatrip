import { Hero } from "@/components/landing/Hero"
import { ValueProps } from "@/components/landing/ValueProps"
import { Testimonials } from "@/components/landing/Testimonials"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturedSpots } from "@/components/landing/FeaturedSpots"
import { BlogSection } from "@/components/landing/BlogSection"

export default function LandingPage() {
  return (
    <>
      <Hero />

      <div className="bg-[#FDFBF7]">
        <ValueProps />
      </div>

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
