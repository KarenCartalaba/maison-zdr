import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_REG_STATUS = "admin:reg-status";
const ADMIN_TTL = 120;

export async function GetRegistrationStatusService() {
  try {
    const cached = await cacheGet<any>(ADMIN_REG_STATUS);
    if (cached) return { code: 200, status: "success", message: "Registration status retrieved successfully", data: cached };

    const status = await adminRepo.getRegistrationStatusCounts();
    const data = { status };
    await cacheSet(ADMIN_REG_STATUS, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Registration status retrieved successfully", data };
  } catch (error) {
    console.error("GetRegistrationStatusService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registration status" };
  }
}
