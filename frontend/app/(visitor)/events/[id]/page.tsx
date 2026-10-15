import { serverFetch } from "@/lib/api";
import EventDetailContent from "@/components/features/events/EventDetailContent";
import type { Event } from "@/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event: Event | null = null;
  try {
    const res = await serverFetch<{
      data?: { event?: Event | null } | null;
      status?: "success" | "error";
      code?: number;
      message?: string;
    }>(`/api/events/v1/${id}`);
    event = res.data?.event ?? null;
    if (!event && res.status === "error" && res.code !== 404) {
      // Not a real 404: log the transient failure instead of swallowing it —
      // EventDetailContent retries on the client before showing "Not Found".
      console.error(`Event SSR (${id}) failed (code=${res.code}):`, res.message);
    }
  } catch (error) {
    // Next's static-render probe (cookies()) — rethrow so the route stays
    // dynamic; only genuine failures deserve a log.
    if ((error as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error(`Event SSR (${id}) threw`, error);
  }

  return <EventDetailContent eventId={id} initialEvent={event} />;
}
