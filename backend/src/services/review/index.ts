import { ReviewRepository } from "@/repositories/review.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const reviewRepo = new ReviewRepository();

export async function CreateReviewService(userId: string, data: { eventId: string; rating: number; title?: string; comment: string }) {
  try {
    const event = await reviewRepo.getEventById(data.eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const existing = await reviewRepo.findExistingReview(userId, data.eventId);
    if (existing) return { code: 409, status: "error", message: "You have already reviewed this event" };

    const review = await reviewRepo.createReview({ ...data, userId });
    await cacheInvalidatePattern("admin:reviews:*");

    return { code: 201, status: "success", message: "Review submitted successfully", data: { review } };
  } catch (error) {
    console.error("CreateReviewService error", error);
    return { code: 500, status: "error", message: "Unable to submit review" };
  }
}
