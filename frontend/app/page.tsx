import type { Metadata } from "next";
import { serverFetch } from "@/lib/api";
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
      serverFetch<{ data: { events: Event[] } }>("/api/events/v1/all"),
      serverFetch<{ data: { news: News[] } }>("/api/news/v1/all"),
    ]);
    events = eventsRes.data?.events ?? [];
    news = newsRes.data?.news ?? [];
  } catch {}

  const now = new Date();
  // "Ongoing" = the event's day has started and is still today. The registration
  // deadline must NOT gate this section: a closed deadline only stops new
  // sign-ups, it does not mean the event is no longer running.
  const isSameCalendarDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const ongoing = events.filter((e) => {
    if (e.isCancelled) return false;
    const eventDate = new Date(e.eventDate);
    return eventDate <= now && isSameCalendarDay(eventDate, now);
  });
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
