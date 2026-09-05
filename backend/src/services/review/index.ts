import { ReviewRepository } from "@/repositories/review.repository";
import { RegistrationRepository } from "@/repositories/registration.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const reviewRepo = new ReviewRepository();
const registrationRepo = new RegistrationRepository();

export async function CreateReviewService(userId: string, data: { eventId: string; rating: number; title?: string; comment: string }) {
  try {
    const event = await reviewRepo.getEventById(data.eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    if (event.isCancelled) return { code: 403, status: "error", message: "event cancelled" };

    const registration = await registrationRepo.findRegistration(userId, data.eventId);
    if (!registration || registration.status === "CANCELLED") {
      return { code: 403, status: "error", message: "only registered participants may review" };
    }

    if (!(event.eventDate < new Date() || event.allowReviewsNow)) {
      return { code: 403, status: "error", message: "reviews open after the event" };
    }

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
