import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TTL = 120;

export async function GetAllCheckInEventsService() {
  try {
    const cached = await cacheGet<any>("admin:checkin-events");
    if (cached) return { code: 200, status: "success", message: "Events retrieved successfully", data: cached };

    const events = await adminRepo.getAllCheckInEvents();
    const data = { events };
    await cacheSet("admin:checkin-events", data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Events retrieved successfully", data };
  } catch (error) {
    console.error("GetAllCheckInEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve events" };
  }
}
