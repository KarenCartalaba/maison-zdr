import { ReviewRepository } from "@/repositories/review.repository";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const reviewRepo = new ReviewRepository();

/**
 * Edit a review the caller wrote. Ownership is checked on every write —
 * there is no admin bypass here (admins moderate with status/reply, never
 * rewriting a guest's words).
 */
export async function UpdateOwnReviewService(
  userId: string,
  reviewId: string,
  data: { rating: number; title?: string | null; comment: string },
) {
  try {
    const review = await reviewRepo.findById(reviewId);
    if (!review) return { code: 404, status: "error", message: "Review not found" };
    if (review.userId !== userId) {
      return { code: 403, status: "error", message: "You can only edit your own review" };
    }

    // An empty title means "no title" — store null, never "".
    const title =
      typeof data.title === "string" ? data.title.trim() || null : (data.title ?? null);

    const updated = await reviewRepo.updateById(reviewId, {
      rating: data.rating,
      title,
      comment: data.comment,
    });

    await cacheInvalidatePattern("admin:*");
    await cacheInvalidate(`event:${review.eventId}`);
    await cacheInvalidatePattern(`event:${review.eventId}*`);
    await cacheInvalidatePattern("events:*");

    return {
      code: 200,
      status: "success",
      message: "Review updated successfully",
      data: { review: updated },
    };
  } catch (error) {
    console.error("UpdateOwnReviewService error", error);
    return { code: 500, status: "error", message: "Unable to update review" };
  }
}