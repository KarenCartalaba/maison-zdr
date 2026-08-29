import { prisma } from "@/lib/prisma";

export async function MyReviewsService(userId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
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
      orderBy: { createdAt: "desc" },
    });

    return {
      code: 200,
      status: "success",
      data: { reviews },
    };
  } catch (error) {
    console.error("MyReviewsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch reviews" };
  }
}
