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
import { selectUpcomingEvents } from "@/lib/upcoming-events";
import { isSameCalendarDay } from "@/components/features/events/event-status";
import type { Event, News } from "@/types";

/** Shape of a serverFetch answer (it never throws — errors come back as data). */
interface SsrListResponse<T> {
  code?: number;
  status?: "success" | "error";
  message?: string;
  data?: T | null;
}

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
      serverFetch<SsrListResponse<{ events: Event[] }>>("/api/events/v1/all"),
      serverFetch<SsrListResponse<{ news: News[] }>>("/api/news/v1/all"),
    ]);

    // serverFetch never throws: failures come back as { status: "error",
    // data: null }. Don't swallow them silently — log what happened and leave
    // the list empty; UpcomingEventsSection then recovers with a client-side
    // refetch of the same real DB records.
    if (Array.isArray(eventsRes.data?.events)) {
      events = eventsRes.data.events;
    } else {
      console.error(
        `Home SSR: events unavailable (code=${eventsRes.code}):`,
        eventsRes.message ?? "no data"
      );
    }
    if (Array.isArray(newsRes.data?.news)) {
      news = newsRes.data.news;
    } else {
      console.error(
        `Home SSR: news unavailable (code=${newsRes.code}):`,
        newsRes.message ?? "no data"
      );
    }
  } catch (error) {
    // Next's static-render probe: cookies() throws while prerendering to
    // mark the route dynamic. Rethrow it — swallowing it would hide the
    // signal — and only log genuine failures.
    if ((error as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("Home SSR: failed to fetch events/news", error);
  }

  const now = new Date();
  // "Ongoing" = the event's day has started and is still today. The registration
  // deadline must NOT gate this section: a closed deadline only stops new
  // sign-ups, it does not mean the event is no longer running. The calendar-day
  // comparison comes from event-status.ts — the single source of truth shared
  // with the EventCard badges and the admin tabs.
  const ongoing = events.filter((e) => {
    if (e.isCancelled) return false;
    const eventDate = new Date(e.eventDate);
    return eventDate <= now && isSameCalendarDay(eventDate, now);
  });
  // "Upcoming" = not cancelled + strictly in the future, ordered by eventDate
  // ascending (soonest first) — the API returns newest-created first, which is
  // wrong for this section. slice(0, 8) happens inside the section, after this.
  const upcoming = selectUpcomingEvents(events, now);

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
