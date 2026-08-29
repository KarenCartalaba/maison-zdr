import { serverFetchAuth } from "@/lib/api";
import AdminNewsContent from "@/components/features/admin/AdminNewsContent";

export default async function AdminNewsPage() {
  let news: any[] = [];
  try {
    const res = await serverFetchAuth<{ data: { news: any[] } }>("/api/news/v1/all");
    news = res.data?.news ?? [];
  } catch {}

  return <AdminNewsContent initialNews={news} />;
}
