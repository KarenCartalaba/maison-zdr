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

  // ==================== Capacity-aware registration ====================

  /**
   * Generate a unique registration reference number (e.g. ZDR-B12-411122).
   * Retries on collision, then falls back to a uuid-based suffix.
   */
  private async generateUniqueReferenceNumber(eventId: string): Promise<string> {
    const prefix = eventId.slice(0, 3).toUpperCase();
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `ZDR-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await this.findRegistrationByReferenceNumber(candidate);
      if (!existing) return candidate;
    }
    return `ZDR-${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  }

  /**
   * Register for an event with capacity enforcement.
   * Locks the Event row FOR UPDATE, re-counts confirmed + guest slots,
   * throws Error("FULL_CAPACITY") if over, else creates or reactivates a registration.
   * Mirrors register-for-event-service.ts transaction logic.
   */
  public registerWithCapacity = async (params: {
    eventId: string;
    userId: string;
    hasPlusOne: boolean;
    guestName?: string;
    guestNames?: string[];
    guestCount: number;
  }) => {
    const { eventId, userId, hasPlusOne, guestName, guestNames, guestCount } = params;

    const existing = await this.findRegistration(userId, eventId);

    return prisma.$transaction(async (tx) => {
      const txc = tx as any;

      // Lock the event row to serialize concurrent registrations
      const lockedEvents: { id: string; max_participants: number }[] =
        await txc.$queryRawUnsafe(
          `SELECT id, "max_participants" FROM "Event" WHERE id = $1 FOR UPDATE`,
          eventId
        );

      const lockedEvent = lockedEvents[0];
      if (!lockedEvent) {
        throw new Error("EVENT_NOT_FOUND");
      }

      // Re-check capacity inside the transaction (fresh count under lock)
      const occupied = await txc.registration.aggregate({
        where: { eventId, status: "CONFIRMED" },
        _sum: { guestCount: true },
        _count: true,
      });
      const confirmedCount = occupied._count + (occupied._sum.guestCount ?? 0);
      const slotsNeeded = 1 + guestCount;

      if (confirmedCount + slotsNeeded > lockedEvent.max_participants) {
        throw new Error("FULL_CAPACITY");
      }

      const referenceNumber = await this.generateUniqueReferenceNumber(eventId);
      const guestNamesValue = guestNames ?? (guestName ? [guestName] : []);

      // Reactivate a previously cancelled registration instead of creating
      // a duplicate row (userId + eventId is unique). Gets a fresh reference number.
      if (existing) {
        return txc.registration.update({
          where: { userId_eventId: { userId, eventId } },
          data: {
            status: RegistrationStatus.CONFIRMED,
            hasPlusOne,
            guestName: guestName ?? null,
            guestNames: guestNamesValue,
            guestCount,
            referenceNumber,
            checkedIn: false,
            checkedInAt: null,
          },
        });
      }

      return txc.registration.create({
        data: {
          userId,
          eventId,
          hasPlusOne,
          guestName,
          guestNames: guestNamesValue,
          guestCount,
          referenceNumber,
        },
      });
    });
  };

  /**
   * Confirm a registration with capacity enforcement.
   * Locks the Event row FOR UPDATE, re-counts confirmed + guest slots,
   * throws Error("FULL_CAPACITY") if over, else updates to CONFIRMED.
   * Mirrors update-registration-status-service.ts CONFIRMED path.
   */
  public confirmWithCapacity = async (params: {
    id: string;
  }) => {
    const { id } = params;

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
      throw new Error("REGISTRATION_NOT_FOUND");
    }

    return prisma.$transaction(async (tx) => {
      const txc = tx as any;

      // Lock the event row to serialize concurrent capacity checks
      const lockedEvents: { id: string; max_participants: number }[] =
        await txc.$queryRawUnsafe(
          `SELECT id, "max_participants" FROM "Event" WHERE id = $1 FOR UPDATE`,
          registration.eventId
        );

      const lockedEvent = lockedEvents[0];
      if (!lockedEvent) {
        throw new Error("EVENT_NOT_FOUND");
      }

      const occupied = await txc.registration.aggregate({
        where: { eventId: registration.eventId, status: "CONFIRMED" },
        _sum: { guestCount: true },
        _count: true,
      });
      const confirmedCount = occupied._count + (occupied._sum.guestCount ?? 0);
      const slotsNeeded = 1 + (registration.guestCount ?? 0);

      if (confirmedCount + slotsNeeded > lockedEvent.max_participants) {
        throw new Error("FULL_CAPACITY");
      }

      return txc.registration.update({ where: { id }, data: { status: RegistrationStatus.CONFIRMED } });
    });
  };

  // ==================== Finders ====================

  public findById = async (id: string) => {
    return prisma.registration.findUnique({ where: { id } });
  };

  /**
   * Find all registrations for a user with event details matching
   * my-registrations-service.ts include shape.
   */
  public findByUser = async (userId: string) => {
    return prisma.registration.findMany({
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
  };

  public countByUser = async (userId: string) => {
    return prisma.registration.count({ where: { userId } });
  };

  public countAttendedByUser = async (userId: string) => {
    return prisma.registration.count({ where: { userId, checkedIn: true } });
  };

  /**
   * Count guests brought by a user (registrations with hasPlusOne = true).
   * Matching profile-stats-service.ts:12-15.
   */
  public sumGuestsByUser = async (userId: string) => {
    const result = await prisma.registration.aggregate({
      where: { userId, hasPlusOne: true },
      _count: true,
    });
    return result._count;
  };

  /**
   * Find registrations eligible for pending reviews.
   * Non-cancelled registrations for non-cancelled events where the event date
   * has passed or admin force-opened reviews.
   * Matching pending-reviews-service.ts:9.
   */
  public findRegistrationsForPendingReviews = async (userId: string) => {
    return prisma.registration.findMany({
      where: {
        userId,
        status: { not: "CANCELLED" },
        event: {
          isCancelled: false,
          OR: [
            { eventDate: { lt: new Date() } },
            { allowReviewsNow: true },
          ],
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            location: true,
            gallery: true,
            allowReviewsNow: true,
          },
        },
      },
    });
  };
}
