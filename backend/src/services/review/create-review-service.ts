import { ReviewRepository } from "@/repositories/review.repository";
import { RegistrationRepository } from "@/repositories/registration.repository";
import { reviewsAreOpen } from "@/utils/event-dates";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

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

    // Reviews auto-open at the event's END datetime — the single source of
    // truth (there is no manual "allow reviews now" override any more).
    if (!reviewsAreOpen(event)) {
      return { code: 403, status: "error", message: "reviews open after the event" };
    }

    const existing = await reviewRepo.findExistingReview(userId, data.eventId);
    if (existing) return { code: 409, status: "error", message: "You have already reviewed this event" };

    // Reviews are auto-published: they go live immediately as APPROVED.
    // They are never taken down — there is no reject/takedown path any more
    // (REVIEW_TRANSITIONS only allows publishing), so a genuine negative
    // review always stays visible to other guests.
    const review = await reviewRepo.createReview({ ...data, userId, status: "APPROVED" });
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidate(`event:${data.eventId}`);
    await cacheInvalidatePattern(`event:${data.eventId}*`);
    await cacheInvalidatePattern("events:*");

    return { code: 201, status: "success", message: "Review submitted successfully", data: { review } };
  } catch (error: any) {
    console.error("CreateReviewService error", error);
    // Handle unique constraint violation (race between check and create)
    if (error?.code === "P2002") {
      return { code: 409, status: "error", message: "already reviewed" };
    }
    return { code: 500, status: "error", message: "Unable to submit review" };
  }
}
