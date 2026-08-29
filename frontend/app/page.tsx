import { serverFetchCached } from "@/lib/api";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import AboutSection from "@/components/features/home/AboutSection";
import HeroSection from "@/components/features/home/HeroSection";
import HowItWorksSection from "@/components/features/home/HowItWorksSection";
import OngoingEventsSection from "@/components/features/home/OngoingEventsSection";
import UpcomingEventsSection from "@/components/features/home/UpcomingEventsSection";
import type { Event } from "@/types";

export default async function Page() {
  let events: Event[] = [];
  try {
    const res = await serverFetchCached<{ data: { events: Event[] } }>("/api/events/v1/all", 300);
    events = res.data?.events ?? [];
  } catch {}

  const now = new Date();
  const ongoing = events.filter(
    (e) => !e.isCancelled && new Date(e.eventDate) <= now && new Date(e.deadline) >= now
  );
  const upcoming = events.filter(
    (e) => !e.isCancelled && new Date(e.eventDate) > now
  );

  return (
    <>
      <Navbar />
      <HeroSection />
      <OngoingEventsSection events={ongoing} />
      <UpcomingEventsSection events={upcoming} />
      <HowItWorksSection />
      <AboutSection />
      <Footer />
    </>
  );
}
