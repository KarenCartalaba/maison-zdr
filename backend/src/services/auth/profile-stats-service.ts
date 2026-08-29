import { prisma } from "@/lib/prisma";

export async function ProfileStatsService(userId: string) {
  try {
    const [eventsRegistered, eventsAttended, reviewsWritten] = await Promise.all([
      prisma.registration.count({ where: { userId } }),
      prisma.registration.count({ where: { userId, checkedIn: true } }),
      prisma.review.count({ where: { userId } }),
    ]);

    // Count guests (registrations with hasPlusOne = true)
    const guestsResult = await prisma.registration.aggregate({
      where: { userId, hasPlusOne: true },
      _count: true,
    });

    return {
      code: 200,
      status: "success",
      data: {
        eventsRegistered,
        eventsAttended,
        reviewsWritten,
        totalGuestsBrought: guestsResult._count,
      },
    };
  } catch (error) {
    console.error("ProfileStatsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch profile stats" };
  }
}
