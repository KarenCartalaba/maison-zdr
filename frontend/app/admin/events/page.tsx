import { serverFetchAuth } from "@/lib/api";
import AdminEventsContent from "@/components/features/admin/AdminEventsContent";

export default async function AdminEventsPage() {
  let events: any[] = [];
  try {
    const res = await serverFetchAuth<{ data: { events: any[] } }>("/api/events/v1/all");
    events = res.data?.events ?? [];
  } catch {}

  return <AdminEventsContent initialEvents={events} />;
}
