import { prisma } from "@/lib/prisma";

export const createEvent = async (data: {
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

export const findEventById = async (id: string) => {
  return prisma.event.findUnique({ where: { id }, include: { author: { select: { id: true, name: true, email: true } } } });
};

export const findEventBySlug = async (slug: string) => {
  return prisma.event.findUnique({ where: { slug }, include: { author: { select: { id: true, name: true, email: true } } } });
};

export const findAllEvents = async () => {
  return prisma.event.findMany({
    include: { author: { select: { id: true, name: true, email: true } }, _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
    orderBy: { createdAt: "desc" },
  });
};

export const updateEvent = async (id: string, data: Partial<{
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
}>) => {
  return prisma.event.update({ where: { id }, data });
};

export const deleteEvent = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};
