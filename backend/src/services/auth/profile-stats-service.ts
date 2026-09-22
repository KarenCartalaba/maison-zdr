import { RegistrationRepository } from "@/repositories/registration.repository";
import { ReviewRepository } from "@/repositories/review.repository";

const registrationRepo = new RegistrationRepository();
const reviewRepo = new ReviewRepository();

export async function ProfileStatsService(userId: string) {
  try {
    const [eventsRegistered, eventsAttended, reviewsWritten] = await Promise.all([
      registrationRepo.countByUser(userId),
      registrationRepo.countAttendedByUser(userId),
      reviewRepo.countByUser(userId),
    ]);

    // Count guests (registrations with hasPlusOne = true)
    const totalGuestsBrought = await registrationRepo.sumGuestsByUser(userId);

    return {
      code: 200,
      status: "success",
      data: {
        eventsRegistered,
        eventsAttended,
        reviewsWritten,
        totalGuestsBrought,
      },
    };
  } catch (error) {
    console.error("ProfileStatsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch profile stats" };
  }
}
