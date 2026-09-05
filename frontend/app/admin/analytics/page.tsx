import AnalyticsContent from "@/components/features/admin/AnalyticsContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminAnalyticsPage() {
  const res = await serverFetchAuth("/api/admin/v1/analytics/overview");

  return <AnalyticsContent initialData={res.data ?? null} />;
}
