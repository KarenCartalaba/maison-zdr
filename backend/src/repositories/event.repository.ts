import { prisma } from "@/lib/prisma";

export class EventRepository {
  public createEvent = async (data: {
    title: string;
    slug: string;
    description: string;
    location: string;
    eventDate: Date;
    deadline: Date;
    minParticipants: number;
    maxParticipants: number;
    authorId: string;
    gallery?: string[];
  }) => {
    return prisma.event.create({ data });
  };

  public findEventById = async (id: string) => {
    return prisma.event.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  };

  public findEventBySlug = async (slug: string) => {
    return prisma.event.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  };

  public findAllEvents = async () => {
    return prisma.event.findMany({
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  public updateEvent = async (
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string;
      location: string;
      eventDate: Date;
      deadline: Date;
      minParticipants: number;
      maxParticipants: number;
      isCancelled: boolean;
      gallery: string[];
    }>
  ) => {
    return prisma.event.update({ where: { id }, data });
  };

  public deleteEvent = async (id: string) => {
    return prisma.event.delete({ where: { id } });
  };
}
