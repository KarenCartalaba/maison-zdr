import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_UPCOMING = "admin:upcoming";
const ADMIN_TTL = 120;

export async function GetUpcomingEventsService(limit?: number) {
  try {
    const key = `${ADMIN_UPCOMING}:${limit || 5}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Upcoming events retrieved successfully", data: cached };

    const events = await adminRepo.getUpcomingEvents(limit || 5);
    const data = { events };
    await cacheSet(key, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Upcoming events retrieved successfully", data };
  } catch (error) {
    console.error("GetUpcomingEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve upcoming events" };
  }
}
