import { prisma } from "@/lib/prisma";
import { RegistrationStatus } from "@/generated/prisma/enums";

export const createRegistration = async (data: {
  userId: string;
  eventId: string;
  hasPlusOne?: boolean;
  guestName?: string;
}) => {
  return prisma.registration.create({ data });
};

export const findRegistration = async (userId: string, eventId: string) => {
  return prisma.registration.findUnique({ where: { userId_eventId: { userId, eventId } } });
};

export const findRegistrationsByEvent = async (eventId: string) => {
  return prisma.registration.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const findRegistrationsByUser = async (userId: string) => {
  return prisma.registration.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });
};

export const cancelRegistration = async (userId: string, eventId: string) => {
  return prisma.registration.update({
    where: { userId_eventId: { userId, eventId } },
    data: { status: RegistrationStatus.CANCELLED },
  });
};

export const countConfirmedRegistrations = async (eventId: string) => {
  return prisma.registration.count({ where: { eventId, status: "CONFIRMED" } });
};
