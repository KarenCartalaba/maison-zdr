import { Suspense } from "react";
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
    }>("/api/profile/v1/stats");
    stats = res.data ?? null;
  } catch {}

  return (
    <Suspense>
      <ProfileContent initialStats={stats} />
    </Suspense>
  );
}
