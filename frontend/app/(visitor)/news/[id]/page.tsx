import { serverFetch } from "@/lib/api";
import NewsDetailContent from "@/components/features/news/NewsDetailContent";
import type { News } from "@/types";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let news: News | null = null;
  try {
    const res = await serverFetch<{
      data?: { news?: News | null } | null;
      status?: "success" | "error";
      code?: number;
      message?: string;
    }>(`/api/news/v1/${id}`);
    news = res.data?.news ?? null;
    if (!news && res.status === "error" && res.code !== 404) {
      // Not a real 404: log the transient failure instead of swallowing it —
      // NewsDetailContent retries on the client before showing "Not Found".
      console.error(`News SSR (${id}) failed (code=${res.code}):`, res.message);
    }
  } catch (error) {
    // Next's static-render probe (cookies()) — rethrow so the route stays
    // dynamic; only genuine failures deserve a log.
    if ((error as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error(`News SSR (${id}) threw`, error);
  }

  return <NewsDetailContent initialNews={news} newsId={id} />;
}
