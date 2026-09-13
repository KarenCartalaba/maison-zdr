import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TOP = "admin:top";
const ADMIN_TTL = 120;

export async function GetTopEventsService(limit?: number) {
  try {
    const key = `${ADMIN_TOP}:${limit || 3}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Top events retrieved successfully", data: cached };

    const events = await adminRepo.getTopEvents(limit || 3);
    const data = { events };
    await cacheSet(key, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Top events retrieved successfully", data };
  } catch (error) {
    console.error("GetTopEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve top events" };
  }
}
