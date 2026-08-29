import { serverFetchAuth } from "@/lib/api";
import DashboardContent from "@/components/features/admin/DashboardContent";

export default async function AdminDashboardPage() {
  const [statsRes, trendRes, statusRes, attendanceRes, categoriesRes, upcomingRes, recentRes, topRes] =
    await Promise.all([
      serverFetchAuth("/api/admin/v1/dashboard/stats").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/registration-trend").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/registration-status").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/attendance-trend").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/top-categories").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/upcoming-events?limit=5").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/recent-registrations?limit=5").catch(() => ({ data: null })),
      serverFetchAuth("/api/admin/v1/dashboard/top-events?limit=5").catch(() => ({ data: null })),
    ]);

  return (
    <DashboardContent
      initialStats={statsRes.data}
      initialTrend={trendRes.data}
      initialStatus={statusRes.data}
      initialAttendance={attendanceRes.data}
      initialCategories={categoriesRes.data}
      initialUpcoming={upcomingRes.data}
      initialRecent={recentRes.data}
      initialTop={topRes.data}
    />
  );
}
