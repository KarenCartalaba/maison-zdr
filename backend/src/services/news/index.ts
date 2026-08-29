import { NewsRepository } from "@/repositories/news.repository";
import { cacheGet, cacheSet, cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const newsRepo = new NewsRepository();

// Cache keys
const NEWS_BY_ID = (id: string) => `news:${id}`;
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

export async function CreateNewsService(data: {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  isPublished?: boolean;
  authorId: string;
}) {
  try {
    const news = await newsRepo.createNews(data);

    // Invalidate news list cache
    await cacheInvalidatePattern("news:*");

    return {
      code: 201,
      status: "success",
      message: "News created successfully",
      data: { news },
    };
  } catch (error) {
    console.error("CreateNewsService error", error);
    return { code: 500, status: "error", message: "Unable to create news" };
  }
}

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
