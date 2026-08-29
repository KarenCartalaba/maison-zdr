import type { Metadata } from "next";
import { serverFetchCached } from "@/lib/api";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import AboutSection from "@/components/features/home/AboutSection";
import HeroSection from "@/components/features/home/HeroSection";
import HowItWorksSection from "@/components/features/home/HowItWorksSection";
import OngoingEventsSection from "@/components/features/home/OngoingEventsSection";
import UpcomingEventsSection from "@/components/features/home/UpcomingEventsSection";
import NewsSection from "@/components/features/home/NewsSection";
import type { Event, News } from "@/types";

export const metadata: Metadata = {
  title: "Zone de Rassemblement | Maison ZDR",
  description: "Discover and register for events at Maison ZDR. Browse upcoming activities, subscribe to events, and join our community.",
  openGraph: {
    title: "Zone de Rassemblement | Maison ZDR",
    description: "Discover and register for events at Maison ZDR. Browse upcoming activities, subscribe to events, and join our community.",
    images: [],
  },
};

export default async function Page() {
  let events: Event[] = [];
  let news: News[] = [];
  try {
    const [eventsRes, newsRes] = await Promise.all([
      serverFetchCached<{ data: { events: Event[] } }>("/api/events/v1/all", 300),
      serverFetchCached<{ data: { news: News[] } }>("/api/news/v1/all", 300),
    ]);
    events = eventsRes.data?.events ?? [];
    news = newsRes.data?.news ?? [];
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
      <NewsSection news={news} />
      <HowItWorksSection />
      <AboutSection />
      <Footer />
    </>
  );
}
