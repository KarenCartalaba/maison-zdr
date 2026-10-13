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

  /**
   * One page of users that should receive the "new article" notification.
   *
   * Deliberately paginated (cursor on the primary key, not skip/take) so a
   * bulk send never materialises the whole user table in memory. Mirrors the
   * AdminRepository.getAllUsers filters, trimmed for email:
   *  - suspended accounts are not mailed;
   *  - unverified addresses are skipped (bounce-prone / typo'd at signup);
   *  - the article's own author is excluded (they already know about it).
   * The where-clause is the single place to relax if we ever want every
   * account included.
   */
  public findNotificationRecipients = async (opts: {
    limit: number;
    afterId?: string;
    excludeUserId?: string;
  }) => {
    return prisma.user.findMany({
      where: {
        suspended: false,
        emailVerified: { not: null },
        ...(opts.excludeUserId ? { id: { not: opts.excludeUserId } } : {}),
      },
      select: { id: true, name: true, email: true },
      orderBy: { id: "asc" },
      // Cursor keeps each page O(limit) no matter how deep we are.
      ...(opts.afterId ? { cursor: { id: opts.afterId }, skip: 1 } : {}),
      take: opts.limit,
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
