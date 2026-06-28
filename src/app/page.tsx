import { Hero } from "@/components/landing/Hero"
import { ValueProps } from "@/components/landing/ValueProps"
import { Features } from "@/components/landing/Features"
import { Testimonials } from "@/components/landing/Testimonials"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturedSpots } from "@/components/landing/FeaturedSpots"
import { WavyDivider } from "@/components/shared/WavyDivider"

export default function LandingPage() {
  return (
    <>
      <div className="section-dark">
        <Hero />
      </div>

      <div className="section-light-alt">
        <ValueProps />
      </div>

      <div className="section-dark-alt">
        <Features />
      </div>

      <div className="bg-background">
        <Testimonials />
      </div>

      <div className="section-light-alt">
        <FeaturedSpots />
      </div>

      <div className="section-dark-alt">
        <HowItWorks />
      </div>
    </>
  )
}
