import { serverFetchCached } from "@/lib/api";
import NewsDetailContent from "@/components/features/news/NewsDetailContent";
import type { News } from "@/types";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let news = null;
  try {
    const res = await serverFetchCached<{ data: { news: News } }>(`/api/news/v1/${id}`, 300);
    news = res.data?.news ?? null;
  } catch {}

  return <NewsDetailContent initialNews={news} />;
}
