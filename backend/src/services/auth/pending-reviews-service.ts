import { RegistrationRepository } from "@/repositories/registration.repository";
import { ReviewRepository } from "@/repositories/review.repository";

const registrationRepo = new RegistrationRepository();
const reviewRepo = new ReviewRepository();

export async function PendingReviewsService(userId: string) {
  try {
    // Find events the user registered for where:
    // - registration is not cancelled
    // - the event is not cancelled
    // - either the event date has passed OR the admin force-opened reviews
    const registrations = await registrationRepo.findRegistrationsForPendingReviews(userId);

    // Get event IDs the user already reviewed
    const reviewedEventIds = await reviewRepo.findReviewedEventIds(userId);
    const reviewedSet = new Set(reviewedEventIds.map((r: { eventId: string }) => r.eventId));

    // Filter out events already reviewed
    const pending = registrations
      .filter((reg: { eventId: string }) => !reviewedSet.has(reg.eventId))
      .map((reg: { event: unknown }) => reg.event);

    return {
      code: 200,
      status: "success",
      data: { pending },
    };
  } catch (error) {
    console.error("PendingReviewsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch pending reviews" };
  }
}
