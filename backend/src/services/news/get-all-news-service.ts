import { NewsRepository } from "@/repositories/news.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const newsRepo = new NewsRepository();

// Cache keys
const NEWS_ALL = "news:all";
const NEWS_PUBLISHED = "news:published";
const NEWS_TTL = 300; // 5 min

export async function GetAllNewsService(publishedOnly = false) {
  try {
    const cacheKey = publishedOnly ? NEWS_PUBLISHED : NEWS_ALL;

    // Check cache first
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return { code: 200, status: "success", data: { news: cached } };
    }

    const news = await newsRepo.findAllNews(publishedOnly);

    // Cache the result
    await cacheSet(cacheKey, news, NEWS_TTL);

    return {
      code: 200,
      status: "success",
      data: { news },
    };
  } catch (error) {
    console.error("GetAllNewsService error", error);
    return { code: 500, status: "error", message: "Unable to fetch news" };
  }
}
