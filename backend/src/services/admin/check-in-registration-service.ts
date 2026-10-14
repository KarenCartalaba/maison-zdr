import { AdminRepository } from "@/repositories/admin.repository";
import { RegistrationRepository } from "@/repositories/registration.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const adminRepo = new AdminRepository();
const registrationRepo = new RegistrationRepository();

export async function CheckInRegistrationService(registrationId: string) {
  try {
    // The duplicate guard lives in the WHERE clause of the atomic UPDATE below
    // (checkedIn: false AND status != CANCELLED), so two concurrent check-ins
    // can never both succeed: only one request matches the row first.
    const { count } = await adminRepo.checkInRegistration(registrationId);

    if (count === 0) {
      // Nothing was written — explain why from a fresh read.
      const current = await registrationRepo.findById(registrationId);
      if (!current) return { code: 404, status: "error", message: "Registration not found" };
      if (current.status === "CANCELLED") {
        return { code: 409, status: "error", message: "Cannot check in a cancelled registration" };
      }
      if (current.checkedIn) return { code: 400, status: "error", message: "Already checked in" };
      return { code: 409, status: "error", message: "Registration cannot be checked in" };
    }

    const updated = await registrationRepo.findById(registrationId);
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidatePattern(`registrations:event:${updated?.eventId}`);
    await cacheInvalidatePattern(`registrations:user:${updated?.userId}`);
    return { code: 200, status: "success", message: "Check-in successful", data: { registration: updated } };
  } catch (error) {
    console.error("CheckInRegistrationService error", error);
    return { code: 500, status: "error", message: "Unable to check in" };
  }
}
