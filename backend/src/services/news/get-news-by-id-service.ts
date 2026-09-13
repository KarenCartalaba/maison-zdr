import { NewsRepository } from "@/repositories/news.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const newsRepo = new NewsRepository();

// Cache keys
const NEWS_BY_ID = (id: string) => `news:${id}`;
const NEWS_TTL = 300; // 5 min

export async function GetNewsByIdService(id: string) {
  try {
    // Check cache first
    const cached = await cacheGet<any>(NEWS_BY_ID(id));
    if (cached) {
      return { code: 200, status: "success", data: { news: cached } };
    }

    const news = await newsRepo.findNewsById(id);
    if (!news) {
      return { code: 404, status: "error", message: "News not found" };
    }

    // Cache the result
    await cacheSet(NEWS_BY_ID(id), news, NEWS_TTL);

    return {
      code: 200,
      status: "success",
      data: { news },
    };
  } catch (error) {
    console.error("GetNewsByIdService error", error);
    return { code: 500, status: "error", message: "Unable to fetch news" };
  }
}
