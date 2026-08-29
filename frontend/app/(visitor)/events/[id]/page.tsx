import { serverFetchCached } from "@/lib/api";
import EventDetailContent from "@/components/features/events/EventDetailContent";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event = null;
  try {
    const res = await serverFetchCached<{ data: { event: any } }>(`/api/events/v1/${id}`, 300);
    event = res.data?.event ?? null;
  } catch {}

  return <EventDetailContent eventId={id} initialEvent={event} />;
}
