import { AdminRepository } from "@/repositories/admin.repository";
import { RegistrationRepository } from "@/repositories/registration.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/nodemailer";

const adminRepo = new AdminRepository();
const registrationRepo = new RegistrationRepository();
const authRepo = new AuthRepository();

export async function UpdateRegistrationStatusService(id: string, status: string) {
  try {
    const registration = await registrationRepo.findById(id);
    if (!registration) return { code: 404, status: "error", message: "Registration not found" };

    // Entering CONFIRMED from any other status consumes a slot — enforce capacity
    // via repository transaction with row-level lock on the Event to prevent races
    if (status === "CONFIRMED" && registration.status !== "CONFIRMED") {
      const updated = await registrationRepo.confirmWithCapacity({ id });

      await cacheInvalidatePattern("admin:regs:*");
      await cacheInvalidatePattern("admin:*");
      await cacheInvalidatePattern(`event:${registration.eventId}*`);
      await cacheInvalidatePattern("events:*");
      await cacheInvalidate(`registrations:event:${registration.eventId}`);
      await cacheInvalidatePattern(`registrations:user:${registration.userId}`);

      return { code: 200, status: "success", message: "Registration status updated", data: { registration: updated } };
    }

    const updated = await adminRepo.updateRegistrationStatus(id, status);
    await cacheInvalidatePattern("admin:regs:*");
    await cacheInvalidatePattern("admin:*");
    // Registration status affects public slot counts (events:all, event:{id})
    await cacheInvalidatePattern(`event:${registration.eventId}*`);
    await cacheInvalidatePattern("events:*");
    await cacheInvalidate(`registrations:event:${registration.eventId}`);
    await cacheInvalidatePattern(`registrations:user:${registration.userId}`);

    // Notify the customer when an admin cancels their registration
    // (mirrors the self-cancel email; restore sends nothing — same reference kept)
    if (status === "CANCELLED" && registration.status !== "CANCELLED") {
      const [user, event] = await Promise.all([
        authRepo.findUserForEmail(registration.userId),
        adminRepo.findEventById(registration.eventId),
      ]);
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
    }

    return { code: 200, status: "success", message: "Registration status updated", data: { registration: updated } };
  } catch (error) {
    console.error("UpdateRegistrationStatusService error", error);
    if (error instanceof Error && error.message === "FULL_CAPACITY") {
      return { code: 400, status: "error", message: "Event is at full capacity" };
    }
    return { code: 500, status: "error", message: "Unable to update registration status" };
  }
}
