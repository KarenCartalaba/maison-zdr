import { AdminRepository } from "@/repositories/admin.repository";
import { computeCheckInStats } from "@/services/admin/check-in-stats";

const adminRepo = new AdminRepository();

export async function GetEventCheckInService(eventId: string) {
  try {
    const event = await adminRepo.getEventForCheckIn(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    // Statistics exclude CANCELLED registrations and include plus-ones, so
    // "expected guests" matches what the door actually expects.
    const stats = computeCheckInStats(event.registrations);

    const data = {
      event,
      registrations: event.registrations,
      // Back-compat keys consumed by the check-in page — now guest-aware.
      checkedInCount: stats.checkedInGuests,
      totalCount: stats.expectedGuests,
      ...stats,
    };
    return { code: 200, status: "success", message: "Event check-in data retrieved", data };
  } catch (error) {
    console.error("GetEventCheckInService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve check-in data" };
  }
}
