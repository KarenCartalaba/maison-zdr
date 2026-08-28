import { prisma } from "@/lib/prisma";
import type { CreateReviewInput } from "@/schema/review";

export class ReviewRepository {
  public createReview = async (data: CreateReviewInput & { userId: string }) => {
    return prisma.review.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    });
  };

  public findExistingReview = async (userId: string, eventId: string) => {
    return prisma.review.findFirst({ where: { userId, eventId } });
  };

  public getEventById = async (id: string) => {
    return prisma.event.findUnique({ where: { id } });
  };
}
