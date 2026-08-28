import AboutSection from "@/components/features/home/AboutSection"
import HeroSection from "@/components/features/home/HeroSection"
import HowItWorksSection from "@/components/features/home/HowItWorksSection"
import OngoingEventsSection from "@/components/features/home/OngoingEventsSection"
import UpcomingEventsSection from "@/components/features/home/UpcomingEventsSection"

export default function Page() {
  return (
    <>
      <HeroSection />
      <OngoingEventsSection />
      <UpcomingEventsSection />
      <HowItWorksSection />
      <AboutSection />
    </>
  )
}
