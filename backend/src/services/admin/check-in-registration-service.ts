import { AdminRepository } from "@/repositories/admin.repository";
import { RegistrationRepository } from "@/repositories/registration.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const adminRepo = new AdminRepository();
const registrationRepo = new RegistrationRepository();

export async function CheckInRegistrationService(registrationId: string) {
  try {
    const registration = await registrationRepo.findById(registrationId);
    if (!registration) return { code: 404, status: "error", message: "Registration not found" };
    if (registration.checkedIn) return { code: 400, status: "error", message: "Already checked in" };

    const updated = await adminRepo.checkInRegistration(registrationId);
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidatePattern(`registrations:event:${registration.eventId}`);
    await cacheInvalidatePattern(`registrations:user:${registration.userId}`);
    return { code: 200, status: "success", message: "Check-in successful", data: { registration: updated } };
  } catch (error) {
    console.error("CheckInRegistrationService error", error);
    return { code: 500, status: "error", message: "Unable to check in" };
  }
}
