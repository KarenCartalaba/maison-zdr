import { NewsRepository } from "@/repositories/news.repository";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const newsRepo = new NewsRepository();

// Cache keys
const NEWS_BY_ID = (id: string) => `news:${id}`;

export async function DeleteNewsService(id: string) {
  try {
    const existing = await newsRepo.findNewsById(id);
    if (!existing) {
      return { code: 404, status: "error", message: "News not found" };
    }

    await newsRepo.deleteNews(id);

    // Invalidate this news + all news caches
    await cacheInvalidate(NEWS_BY_ID(id));
    await cacheInvalidatePattern("news:*");

    return {
      code: 200,
      status: "success",
      message: "News deleted successfully",
    };
  } catch (error) {
    console.error("DeleteNewsService error", error);
    return { code: 500, status: "error", message: "Unable to delete news" };
  }
}
