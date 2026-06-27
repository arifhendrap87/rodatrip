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
      <div className="bg-background">
        <Hero />
      </div>

      <WavyDivider />

      <div className="bg-primary/[0.03]">
        <ValueProps />
      </div>

      <WavyDivider />

      <div className="bg-primary/[0.03]">
        <Features />
      </div>

      <WavyDivider />

      <div className="bg-background">
        <Testimonials />
      </div>

      <WavyDivider />

      <div className="bg-primary/[0.03]">
        <FeaturedSpots />
      </div>

      <WavyDivider />

      <div className="bg-background">
        <HowItWorks />
      </div>
    </>
  )
}
