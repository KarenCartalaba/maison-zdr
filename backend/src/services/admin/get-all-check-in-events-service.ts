import { AdminRepository } from "@/repositories/admin.repository";
import { registrationHeadcount } from "@/services/admin/check-in-stats";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TTL = 120;

export async function GetAllCheckInEventsService() {
  try {
    const cached = await cacheGet<any>("admin:checkin-events");
    if (cached) return { code: 200, status: "success", message: "Events retrieved successfully", data: cached };

    const events = await adminRepo.getAllCheckInEvents();
    // The picker badge must match the roster's "Expected Guests" stat, so each
    // event gets its guest headcount (registrant + plus-ones, CANCELLED rows
    // already excluded upstream — same rule as computeCheckInStats). The raw
    // registration rows only exist to compute that figure and are stripped
    // from the (cached) payload.
    const data = {
      events: events.map(({ registrations, ...event }) => ({
        ...event,
        expectedGuests: registrations.reduce(
          (sum, registration) => sum + registrationHeadcount(registration),
          0,
        ),
      })),
    };
    await cacheSet("admin:checkin-events", data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Events retrieved successfully", data };
  } catch (error) {
    console.error("GetAllCheckInEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve events" };
  }
}
