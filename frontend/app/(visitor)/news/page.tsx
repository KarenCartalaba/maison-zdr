import { serverFetchCached } from "@/lib/api";
import NewsContent from "@/components/features/news/NewsContent";
import type { News } from "@/types";

export default async function NewsPage() {
  let news: News[] = [];
  try {
    const res = await serverFetchCached<{ data: { news: News[] } }>("/api/news/v1/all", 300);
    news = res.data?.news ?? [];
  } catch {}

  return <NewsContent initialNews={news} />;
}
