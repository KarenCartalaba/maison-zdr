import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_RECENT = "admin:recent";
const ADMIN_TTL = 120;

export async function GetRecentRegistrationsService(limit?: number) {
  try {
    const key = `${ADMIN_RECENT}:${limit || 5}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Recent registrations retrieved successfully", data: cached };

    const registrations = await adminRepo.getRecentRegistrations(limit || 5);
    const data = { registrations };
    await cacheSet(key, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Recent registrations retrieved successfully", data };
  } catch (error) {
    console.error("GetRecentRegistrationsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve recent registrations" };
  }
}
