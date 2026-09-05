import { serverFetchAuth } from "@/lib/api";
import RegistrationWizardContent from "@/components/features/registration/RegistrationWizardContent";

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event: any = null;
  try {
    const res = await serverFetchAuth<{ data: { event: any } }>(`/api/events/v1/${id}`);
    event = res.data?.event ?? null;
  } catch {}

  return <RegistrationWizardContent initialEvent={event} />;
}
