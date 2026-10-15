import { ReviewRepository } from "@/repositories/review.repository";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const reviewRepo = new ReviewRepository();

/**
 * Remove one of the caller's own reviews. Deleting frees the unique
 * (userId, eventId) slot, so the guest can write a fresh review for that
 * event — the profile's "waiting on your review" list picks it up again.
 */
export async function DeleteOwnReviewService(userId: string, reviewId: string) {
  try {
    const review = await reviewRepo.findById(reviewId);
    if (!review) return { code: 404, status: "error", message: "Review not found" };
    if (review.userId !== userId) {
      return { code: 403, status: "error", message: "You can only delete your own review" };
    }

    await reviewRepo.deleteById(reviewId);

    await cacheInvalidatePattern("admin:*");
    await cacheInvalidate(`event:${review.eventId}`);
    await cacheInvalidatePattern(`event:${review.eventId}*`);
    await cacheInvalidatePattern("events:*");

    return { code: 200, status: "success", message: "Review deleted successfully" };
  } catch (error) {
    console.error("DeleteOwnReviewService error", error);
    return { code: 500, status: "error", message: "Unable to delete review" };
  }
}