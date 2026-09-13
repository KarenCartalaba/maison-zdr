import { AdminRepository } from "@/repositories/admin.repository";
import { cacheInvalidatePattern, cacheInvalidate } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const adminRepo = new AdminRepository();

export async function UpdateReviewStatusService(id: string, status: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return { code: 404, status: "error", message: "Review not found" };

    const updated = await adminRepo.updateReviewStatus(id, status);
    await cacheInvalidatePattern("admin:reviews:*");
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidate(`event:${review.eventId}`);
    return { code: 200, status: "success", message: "Review status updated", data: { review: updated } };
  } catch (error) {
    console.error("UpdateReviewStatusService error", error);
    return { code: 500, status: "error", message: "Unable to update review status" };
  }
}
