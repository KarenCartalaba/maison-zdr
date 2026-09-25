import { RegistrationRepository } from "@/repositories/registration.repository";
import { EventRepository } from "@/repositories/event.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/email";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const registrationRepo = new RegistrationRepository();
const eventRepo = new EventRepository();
const authRepo = new AuthRepository();

// Cache keys
const REG_BY_EVENT = (eventId: string) => `registrations:event:${eventId}`;
const REG_BY_USER = (userId: string) => `registrations:user:${userId}`;

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

    const effectiveGuestCount = guestCount ?? (hasPlusOne ? 1 : 0);

    if (effectiveGuestCount > 0 && !guestName) {
      return { code: 400, status: "error", message: "Guest name is required for plus-one registration" };
    }

    const registration = await registrationRepo.registerWithCapacity({
      eventId,
      userId,
      hasPlusOne,
      guestName,
      guestNames,
      guestCount: effectiveGuestCount,
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
    if (error instanceof Error && error.message === "FULL_CAPACITY") {
      return { code: 400, status: "error", message: "Event is at full capacity" };
    }
    return { code: 500, status: "error", message: "Unable to register for event" };
  }
}
