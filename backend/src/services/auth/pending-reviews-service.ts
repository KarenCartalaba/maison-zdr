import { prisma } from "@/lib/prisma";

export async function PendingReviewsService(userId: string) {
  try {
    // Find events the user registered for where:
    // - user hasn't written a review yet
    // - either checkedIn = true OR the event date has passed
    const registrations = await prisma.registration.findMany({
      where: {
        userId,
        OR: [
          { checkedIn: true },
          { event: { eventDate: { lt: new Date() } } },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            location: true,
            gallery: true,
          },
        },
      },
    });

    // Get event IDs the user already reviewed
    const reviewedEventIds = await prisma.review.findMany({
      where: { userId },
      select: { eventId: true },
    });
    const reviewedSet = new Set(reviewedEventIds.map((r) => r.eventId));

    // Filter out events already reviewed
    const pending = registrations
      .filter((reg) => !reviewedSet.has(reg.eventId))
      .map((reg) => reg.event);

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
