import AdminEventsContent from "@/components/features/admin/AdminEventsContent";
import { serverFetchAuth } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";

export default async function AdminEventsPage() {
  // Moderator endpoint, not the public /events/v1/all: the public catalogue
  // now EXCLUDES cancelled events, which the admin list must still show.
  const res = await serverFetchAuth(API_ENDPOINTS.EVENTS.ADMIN_LIST);

  return <AdminEventsContent initialEvents={res.data?.events ?? []} />;
}
