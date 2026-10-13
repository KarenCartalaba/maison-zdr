import EditEventContent from "@/components/features/admin/EditEventContent";
import { serverFetchAuth } from "@/lib/api";
import type { ApiResponse, Event } from "@/types";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await serverFetchAuth<ApiResponse<{ event: Event }>>(
    `/api/events/v1/${id}`
  );

  return <EditEventContent initialEvent={res.data?.event ?? null} />;
}
