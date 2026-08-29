import { prisma } from "@/lib/prisma";
import type { CreateNewsInput, UpdateNewsInput } from "@/schema/news";

export class NewsRepository {
  public createNews = async (data: CreateNewsInput & { authorId: string }) => {
    return prisma.news.create({
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  };

  public findNewsById = async (id: string) => {
    return prisma.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  };

  public findAllNews = async (publishedOnly = false) => {
    return prisma.news.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  };

  public updateNews = async (id: string, data: Partial<UpdateNewsInput>) => {
    return prisma.news.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  };

  public deleteNews = async (id: string) => {
    return prisma.news.delete({ where: { id } });
  };
}
