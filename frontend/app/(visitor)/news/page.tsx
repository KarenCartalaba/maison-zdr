import { serverFetch } from "@/lib/api";
import NewsContent from "@/components/features/news/NewsContent";
import type { News } from "@/types";

export default async function NewsPage() {
  let news: News[] = [];
  try {
    const res = await serverFetch<{ data: { news: News[] } }>("/api/news/v1/all");
    news = res.data?.news ?? [];
  } catch {}

  return <NewsContent initialNews={news} />;
}
