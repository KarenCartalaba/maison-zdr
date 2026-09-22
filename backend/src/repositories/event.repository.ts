import { prisma } from "@/lib/prisma";
import type { CreateEventInput, UpdateEventInput } from "@/schema/event";

export class EventRepository {
  public createEvent = async (data: CreateEventInput & { slug: string; authorId: string }) => {
    return prisma.event.create({ data });
  };

  public findEventById = async (id: string) => {
    return prisma.event.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
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

  public updateEvent = async (id: string, data: Partial<UpdateEventInput> & { slug?: string }) => {
    return prisma.event.update({ where: { id }, data });
  };

  public deleteEvent = async (id: string) => {
    return prisma.event.delete({ where: { id } });
  };

  // ==================== Window queries ====================

  /**
   * Find non-cancelled events whose eventDate falls between `from` and `to`,
   * including CONFIRMED registrations with full user data.
   * Matching event-reminder-service.ts:71-85 window query.
   */
  public findEventsStartingBetween = async (from: Date, to: Date) => {
    return prisma.event.findMany({
      where: {
        isCancelled: false,
        eventDate: {
          gte: from,
          lte: to,
        },
      },
      include: {
        registrations: {
          where: { status: "CONFIRMED" },
          include: { user: true },
        },
      },
    });
  };
}
