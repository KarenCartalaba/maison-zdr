import { prisma } from "@/lib/prisma";
import { RegistrationStatus } from "@/generated/prisma/enums";
import type { RegisterInput } from "@/schema/registration";

export class RegistrationRepository {
  public createRegistration = async (data: RegisterInput & { userId: string; referenceNumber?: string }) => {
    return prisma.registration.create({ data });
  };

  public findRegistrationByReferenceNumber = async (referenceNumber: string) => {
    return prisma.registration.findUnique({
      where: { referenceNumber },
    });
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
    // Cancelling voids the whole attendance record (clears any stale check-in)
    return prisma.registration.update({
      where: { userId_eventId: { userId, eventId } },
      data: { status: RegistrationStatus.CANCELLED, checkedIn: false, checkedInAt: null },
    });
  };

  public updateRegistration = async (
    userId: string,
    eventId: string,
    data: {
      status?: RegistrationStatus;
      hasPlusOne?: boolean;
      guestName?: string | null;
      guestNames?: string[];
      guestCount?: number;
      referenceNumber?: string;
      checkedIn?: boolean;
      checkedInAt?: Date | null;
    }
  ) => {
    return prisma.registration.update({
      where: { userId_eventId: { userId, eventId } },
      data,
    });
  };

  public countConfirmedRegistrations = async (eventId: string) => {
    const result = await prisma.registration.aggregate({
      where: { eventId, status: "CONFIRMED" },
      _sum: { guestCount: true },
      _count: true,
    });
    return result._count + (result._sum.guestCount ?? 0);
  };
}
