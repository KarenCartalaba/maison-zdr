import { serverFetchCached } from "@/lib/api";
import EventsContent from "@/components/features/events/EventsContent";
import type { Event } from "@/types";

export default async function EventsPage() {
  let events: Event[] = [];
  try {
    const res = await serverFetchCached<{ data: { events: Event[] } }>("/api/events/v1/all", 300);
    events = res.data?.events ?? [];
  } catch {}

  return <EventsContent initialEvents={events} />;
}
