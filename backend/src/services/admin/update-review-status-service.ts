import { AdminRepository } from "@/repositories/admin.repository";
import { ReviewRepository } from "@/repositories/review.repository";
import { cacheInvalidatePattern, cacheInvalidate } from "@/lib/redis";

const adminRepo = new AdminRepository();
const reviewRepo = new ReviewRepository();

export async function UpdateReviewStatusService(id: string, status: string) {
  try {
    const review = await reviewRepo.findById(id);
    if (!review) return { code: 404, status: "error", message: "Review not found" };

    const updated = await adminRepo.updateReviewStatus(id, status);
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidate(`event:${review.eventId}`);
    await cacheInvalidatePattern(`event:${review.eventId}*`);
    await cacheInvalidatePattern("events:*");
    return { code: 200, status: "success", message: "Review status updated", data: { review: updated } };
  } catch (error) {
    console.error("UpdateReviewStatusService error", error);
    return { code: 500, status: "error", message: "Unable to update review status" };
  }
}
