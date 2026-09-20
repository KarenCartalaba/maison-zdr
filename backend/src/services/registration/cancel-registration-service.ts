import { RegistrationRepository } from "@/repositories/registration.repository";
import { EventRepository } from "@/repositories/event.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/nodemailer";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const registrationRepo = new RegistrationRepository();
const eventRepo = new EventRepository();
const authRepo = new AuthRepository();

// Cache keys
const REG_BY_EVENT = (eventId: string) => `registrations:event:${eventId}`;
const REG_BY_USER = (userId: string) => `registrations:user:${userId}`;

export async function CancelRegistrationService(userId: string, eventId: string) {
  try {
    const registration = await registrationRepo.findRegistration(userId, eventId);
    if (!registration) {
      return { code: 404, status: "error", message: "Registration not found" };
    }

    if (registration.status === "CANCELLED") {
      return { code: 400, status: "error", message: "Registration is already cancelled" };
    }

    await registrationRepo.cancelRegistration(userId, eventId);

    // Invalidate registration caches + event cache
    await cacheInvalidate(REG_BY_EVENT(eventId));
    await cacheInvalidate(REG_BY_USER(userId));
    await cacheInvalidatePattern("event:*");
    await cacheInvalidatePattern("events:*");
    await cacheInvalidatePattern("admin:*");

    const event = await eventRepo.findEventById(eventId);
    const user = await authRepo.findUserById(userId);

    if (user?.email && event) {
      const html = renderTemplate("event-cancellation.html", {
        userName: user.name ?? "there",
        eventName: event.title,
      });

      sendEmail({
        to: user.email,
        subject: `Registration Cancelled: ${event.title}`,
        html,
      }).catch((err) => console.error("Failed to send cancellation email:", err));
    }

    return {
      code: 200,
      status: "success",
      message: "Registration cancelled successfully",
    };
  } catch (error) {
    console.error("CancelRegistrationService error", error);
    return { code: 500, status: "error", message: "Unable to cancel registration" };
  }
}
