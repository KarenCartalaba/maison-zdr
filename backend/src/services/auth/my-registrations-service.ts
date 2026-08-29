import { prisma } from "@/lib/prisma";

export async function MyRegistrationsService(userId: string) {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            location: true,
            eventDate: true,
            deadline: true,
            maxParticipants: true,
            isCancelled: true,
            eventType: true,
            gallery: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      code: 200,
      status: "success",
      data: { registrations },
    };
  } catch (error) {
    console.error("MyRegistrationsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch registrations" };
  }
}
