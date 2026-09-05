import AdminEventsContent from "@/components/features/admin/AdminEventsContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminEventsPage() {
  const res = await serverFetchAuth("/api/events/v1/all");

  return <AdminEventsContent initialEvents={res.data?.events ?? []} />;
}
