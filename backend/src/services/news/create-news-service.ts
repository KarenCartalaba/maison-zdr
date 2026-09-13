import { NewsRepository } from "@/repositories/news.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const newsRepo = new NewsRepository();

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
