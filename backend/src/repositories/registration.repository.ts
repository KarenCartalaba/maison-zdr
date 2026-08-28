import { prisma } from "@/lib/prisma";
import { RegistrationStatus } from "@/generated/prisma/enums";
import type { RegisterInput } from "@/schema/registration";

export class RegistrationRepository {
  public createRegistration = async (data: RegisterInput & { userId: string }) => {
    return prisma.registration.create({ data });
  };

  public findRegistration = async (userId: string, eventId: string) => {
    return prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
  };

  public findRegistrationsByEvent = async (eventId: string) => {
    return prisma.registration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  };

  public findRegistrationsByUser = async (userId: string) => {
    return prisma.registration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
  };

  public cancelRegistration = async (userId: string, eventId: string) => {
    return prisma.registration.update({
      where: { userId_eventId: { userId, eventId } },
      data: { status: RegistrationStatus.CANCELLED },
    });
  };

  public countConfirmedRegistrations = async (eventId: string) => {
    return prisma.registration.count({ where: { eventId, status: "CONFIRMED" } });
  };
}
