import { AdminRepository } from "@/repositories/admin.repository";
import { ReviewRepository } from "@/repositories/review.repository";
import { cacheInvalidatePattern, cacheInvalidate } from "@/lib/redis";

const adminRepo = new AdminRepository();
const reviewRepo = new ReviewRepository();

export async function ReplyToReviewService(id: string, reply: string) {
  try {
    const review = await reviewRepo.findById(id);
    if (!review) return { code: 404, status: "error", message: "Review not found" };

    const updated = await adminRepo.replyToReview(id, reply);
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidate(`event:${review.eventId}`);
    await cacheInvalidatePattern(`event:${review.eventId}*`);
    await cacheInvalidatePattern("events:*");
    return { code: 200, status: "success", message: "Reply added successfully", data: { review: updated } };
  } catch (error) {
    console.error("ReplyToReviewService error", error);
    return { code: 500, status: "error", message: "Unable to add reply" };
  }
}
