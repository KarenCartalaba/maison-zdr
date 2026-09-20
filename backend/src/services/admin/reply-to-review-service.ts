import { AdminRepository } from "@/repositories/admin.repository";
import { cacheInvalidatePattern, cacheInvalidate } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const adminRepo = new AdminRepository();

export async function ReplyToReviewService(id: string, reply: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return { code: 404, status: "error", message: "Review not found" };

    const updated = await adminRepo.replyToReview(id, reply);
    await cacheInvalidatePattern("admin:reviews:*");
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
