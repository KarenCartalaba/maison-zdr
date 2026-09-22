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

  // ==================== Finders ====================

  /**
   * Find a review by its id.
   * Used by reply-to-review-service and update-review-status-service
   * (replacing direct prisma.review.findUnique calls).
   */
  public findById = async (id: string) => {
    return prisma.review.findUnique({ where: { id } });
  };

  /**
   * Find all reviews for a user with event details matching
   * my-reviews-service.ts include shape.
   */
  public findByUser = async (userId: string) => {
    return prisma.review.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            location: true,
            gallery: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  /**
   * Find event IDs that a user has already reviewed.
   * Matching pending-reviews-service.ts:36-39.
   */
  public findReviewedEventIds = async (userId: string) => {
    return prisma.review.findMany({
      where: { userId },
      select: { eventId: true },
    });
  };

  public countByUser = async (userId: string) => {
    return prisma.review.count({ where: { userId } });
  };

  /**
   * Find approved reviews for an event with user select matching
   * event.controller.ts:65-71.
   */
  public findApprovedByEvent = async (eventId: string) => {
    return prisma.review.findMany({
      where: { eventId, status: "APPROVED" },
      include: {
        user: { select: { id: true, name: true, profilePic: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };
}
