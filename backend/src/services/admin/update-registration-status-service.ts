import { AdminRepository } from "@/repositories/admin.repository";
import { RegistrationRepository } from "@/repositories/registration.repository";
import { cacheInvalidatePattern } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/nodemailer";

const adminRepo = new AdminRepository();
const registrationRepo = new RegistrationRepository();

export async function UpdateRegistrationStatusService(id: string, status: string) {
  try {
    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) return { code: 404, status: "error", message: "Registration not found" };

    // Entering CONFIRMED from any other status consumes a slot — enforce capacity
    if (status === "CONFIRMED" && registration.status !== "CONFIRMED") {
      const event = await adminRepo.findEventById(registration.eventId);
      if (!event) return { code: 404, status: "error", message: "Event not found" };
      const occupied = await registrationRepo.countConfirmedRegistrations(registration.eventId);
      const slotsNeeded = 1 + (registration.guestCount ?? 0);
      if (occupied + slotsNeeded > event.maxParticipants) {
        return { code: 400, status: "error", message: "Event is at full capacity" };
      }
    }

    const updated = await adminRepo.updateRegistrationStatus(id, status);
    await cacheInvalidatePattern("admin:regs:*");
    await cacheInvalidatePattern("admin:*");
    // Registration status affects public slot counts (events:all, event:{id})
    await cacheInvalidatePattern(`event:${registration.eventId}*`);
    await cacheInvalidatePattern("events:*");
    await cacheInvalidatePattern(`registrations:user:${registration.userId}`);

    // Notify the customer when an admin cancels their registration
    // (mirrors the self-cancel email; restore sends nothing — same reference kept)
    if (status === "CANCELLED" && registration.status !== "CANCELLED") {
      const [user, event] = await Promise.all([
        prisma.user.findUnique({ where: { id: registration.userId } }),
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
    return { code: 500, status: "error", message: "Unable to update registration status" };
  }
}
