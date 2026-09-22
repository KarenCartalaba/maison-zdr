import { serverFetchAuth } from "@/lib/api";
import MyRegistrationsContent from "@/components/features/my-registrations/MyRegistrationsContent";

export default async function MyRegistrationsPage() {
  let registrations: any[] = [];
  try {
    const res = await serverFetchAuth<{ data: { registrations: any[] } }>("/api/registrations/v1/mine");
    registrations = res.data?.registrations ?? [];
  } catch {}

  return <MyRegistrationsContent initialRegistrations={registrations} />;
}
