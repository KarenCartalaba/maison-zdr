import RegistrationsContent from "@/components/features/admin/RegistrationsContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminRegistrationsPage() {
  const res = await serverFetchAuth("/api/admin/v1/registrations");

  return (
    <RegistrationsContent
      initialRegistrations={res.data?.registrations ?? null}
      initialStats={res.data?.stats ?? null}
    />
  );
}
