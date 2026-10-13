import CheckInsContent from "@/components/features/admin/CheckInsContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminCheckInsPage() {
  const eventsRes = await serverFetchAuth("/api/admin/v1/checkins/events");
  const events = eventsRes.data?.events ?? null;

  // The client auto-selects the first event; prefetch its check-in list too.
  const checkInRes = events?.length
    ? await serverFetchAuth(`/api/admin/v1/checkins/events/${events[0].id}`)
    : null;

  return (
    <CheckInsContent
      initialEvents={events}
      initialCheckIn={checkInRes?.data ?? null}
    />
  );
}
