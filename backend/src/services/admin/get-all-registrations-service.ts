import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TTL = 120;

export async function GetAllRegistrationsService(filters?: { status?: string; search?: string; eventId?: string }) {
  try {
    const key = `admin:regs:${filters?.status || "ALL"}:${filters?.search || ""}:${filters?.eventId || ""}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Registrations retrieved successfully", data: cached };

    const [registrations, stats] = await Promise.all([
      adminRepo.getAllRegistrations(filters),
      adminRepo.getRegistrationStats(),
    ]);
    const data = { registrations, stats };
    await cacheSet(key, data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Registrations retrieved successfully", data };
  } catch (error) {
    console.error("GetAllRegistrationsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registrations" };
  }
}
