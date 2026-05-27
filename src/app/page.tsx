import { Hero } from "@/components/landing/Hero"
import { ValueProps } from "@/components/landing/ValueProps"
import { StatsSection } from "@/components/landing/StatsSection"
import { Features } from "@/components/landing/Features"
import { Testimonials } from "@/components/landing/Testimonials"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturedSpots } from "@/components/landing/FeaturedSpots"
import { WaitlistSection } from "@/components/landing/WaitlistSection"
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

      <div className="bg-background">
        <StatsSection />
      </div>

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

      <WavyDivider />

      <div className="bg-background">
        <WaitlistSection />
      </div>
    </>
  )
}
