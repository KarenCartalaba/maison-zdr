import { serverFetch } from "@/lib/api";
import EventDetailContent from "@/components/features/events/EventDetailContent";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event = null;
  try {
    const res = await serverFetch<{ data: { event: any } }>(`/api/events/v1/${id}`);
    event = res.data?.event ?? null;
  } catch {}

  return <EventDetailContent eventId={id} initialEvent={event} />;
}
