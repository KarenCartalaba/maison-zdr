import { NewsRepository } from "@/repositories/news.repository";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const newsRepo = new NewsRepository();

// Cache keys
const NEWS_BY_ID = (id: string) => `news:${id}`;

export async function UpdateNewsService(data: {
  id: string;
  title?: string;
  content?: string;
  summary?: string;
  imageUrl?: string;
  isPublished?: boolean;
}) {
  try {
    const existing = await newsRepo.findNewsById(data.id);
    if (!existing) {
      return { code: 404, status: "error", message: "News not found" };
    }

    const updateData: any = { ...data };
    delete updateData.id;

    const news = await newsRepo.updateNews(data.id, updateData);

    // Invalidate this news + list cache
    await cacheInvalidate(NEWS_BY_ID(data.id));
    await cacheInvalidatePattern("news:*");

    return {
      code: 200,
      status: "success",
      message: "News updated successfully",
      data: { news },
    };
  } catch (error) {
    console.error("UpdateNewsService error", error);
    return { code: 500, status: "error", message: "Unable to update news" };
  }
}
