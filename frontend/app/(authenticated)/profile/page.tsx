import { serverFetchAuth } from "@/lib/api";
import ProfileContent from "@/components/features/profile/ProfileContent";

export default async function ProfilePage() {
  let stats = null;
  try {
    const res = await serverFetchAuth<{
      data: {
        eventsRegistered: number;
        eventsAttended: number;
        reviewsWritten: number;
        totalGuestsBrought: number;
      };
    }>("/api/auth/v1/profile-stats");
    stats = res.data ?? null;
  } catch {}

  return <ProfileContent initialStats={stats} />;
}
