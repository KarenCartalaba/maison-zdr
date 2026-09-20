import { RegistrationRepository } from "@/repositories/registration.repository";
import { EventRepository } from "@/repositories/event.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/nodemailer";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const registrationRepo = new RegistrationRepository();
const eventRepo = new EventRepository();
const authRepo = new AuthRepository();

// Cache keys
const REG_BY_EVENT = (eventId: string) => `registrations:event:${eventId}`;
const REG_BY_USER = (userId: string) => `registrations:user:${userId}`;

/**
 * Generate a unique registration reference number (e.g. ZDR-B12-411122).
 * Retries on collision, then falls back to a uuid-based suffix.
 */
async function generateUniqueReferenceNumber(eventId: string): Promise<string> {
  const prefix = eventId.slice(0, 3).toUpperCase();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `ZDR-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await registrationRepo.findRegistrationByReferenceNumber(candidate);
    if (!existing) return candidate;
  }
  return `ZDR-${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export async function RegisterForEventService(
  userId: string,
  eventId: string,
  hasPlusOne: boolean,
  guestName?: string,
  guestNames?: string[],
  guestCount?: number
) {
  try {
    const event = await eventRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    if (event.isCancelled) {
      return { code: 400, status: "error", message: "This event has been cancelled" };
    }

    if (new Date() > new Date(event.deadline)) {
      return { code: 400, status: "error", message: "Registration deadline has passed" };
    }

    const existing = await registrationRepo.findRegistration(userId, eventId);
    if (existing && existing.status === "CONFIRMED") {
      return { code: 409, status: "error", message: "Already registered for this event" };
    }

    const confirmedCount = await registrationRepo.countConfirmedRegistrations(eventId);
    const effectiveGuestCount = guestCount ?? (hasPlusOne ? 1 : 0);
    const slotsNeeded = 1 + effectiveGuestCount;

    if (confirmedCount + slotsNeeded > event.maxParticipants) {
      return { code: 400, status: "error", message: "Event is at full capacity" };
    }

    if (effectiveGuestCount > 0 && !guestName) {
      return { code: 400, status: "error", message: "Guest name is required for plus-one registration" };
    }

    const referenceNumber = await generateUniqueReferenceNumber(eventId);
    const guestNamesValue = guestNames ?? (guestName ? [guestName] : []);

    // Reactivate a previously cancelled registration instead of creating
    // a duplicate row (userId + eventId is unique). Gets a fresh reference number.
    const registration = existing
      ? await registrationRepo.updateRegistration(userId, eventId, {
          status: RegistrationStatus.CONFIRMED,
          hasPlusOne,
          guestName: guestName ?? null,
          guestNames: guestNamesValue,
          guestCount: effectiveGuestCount,
          referenceNumber,
          checkedIn: false,
          checkedInAt: null,
        })
      : await registrationRepo.createRegistration({
          userId,
          eventId,
          hasPlusOne,
          guestName,
          guestNames: guestNamesValue,
          guestCount: effectiveGuestCount,
          referenceNumber,
        });

    // Invalidate registration caches + event cache (counts changed)
    await cacheInvalidate(REG_BY_EVENT(eventId));
    await cacheInvalidate(REG_BY_USER(userId));
    await cacheInvalidatePattern("event:*");
    await cacheInvalidatePattern("events:*");
    await cacheInvalidatePattern("admin:*");

    const user = await authRepo.findUserById(userId);
    if (user?.email) {
      const html = renderTemplate("event-registration.html", {
        userName: user.name ?? "there",
        eventName: event.title,
        eventDate: new Date(event.eventDate).toUTCString(),
        eventLocation: event.location,
        hasPlusOne: String(hasPlusOne),
        guestName: guestNames?.join(", ") ?? guestName ?? "",
        guestCount: String(effectiveGuestCount),
        referenceNumber: registration.referenceNumber ?? "",
      });

      sendEmail({
        to: user.email,
        subject: `Registration Confirmed: ${event.title}`,
        html,
      }).catch((err) => console.error("Failed to send registration email:", err));
    }

    return {
      code: existing ? 200 : 201,
      status: "success",
      message: "Registration successful",
      data: { registration },
    };
  } catch (error) {
    console.error("RegisterForEventService error", error);
    return { code: 500, status: "error", message: "Unable to register for event" };
  }
}
