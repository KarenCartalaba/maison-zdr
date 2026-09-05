import DashboardContent from "@/components/features/admin/DashboardContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminDashboardPage() {
  const [
    statsRes,
    trendRes,
    statusRes,
    attendanceRes,
    categoriesRes,
    upcomingRes,
    recentRes,
    topRes,
  ] = await Promise.all([
    serverFetchAuth("/api/admin/v1/dashboard/stats"),
    serverFetchAuth("/api/admin/v1/dashboard/registration-trend"),
    serverFetchAuth("/api/admin/v1/dashboard/registration-status"),
    serverFetchAuth("/api/admin/v1/dashboard/attendance-trend"),
    serverFetchAuth("/api/admin/v1/dashboard/top-categories"),
    serverFetchAuth("/api/admin/v1/dashboard/upcoming-events?limit=5"),
    serverFetchAuth("/api/admin/v1/dashboard/recent-registrations?limit=5"),
    serverFetchAuth("/api/admin/v1/dashboard/top-events?limit=5"),
  ]);

  return (
    <DashboardContent
      initialStats={statsRes.data ?? null}
      initialTrend={trendRes.data ?? null}
      initialStatus={statusRes.data ?? null}
      initialAttendance={attendanceRes.data ?? null}
      initialCategories={categoriesRes.data ?? null}
      initialUpcoming={upcomingRes.data ?? null}
      initialRecent={recentRes.data ?? null}
      initialTop={topRes.data ?? null}
    />
  );
}
