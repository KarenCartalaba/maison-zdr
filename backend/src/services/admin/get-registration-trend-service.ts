import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_REG_TREND = "admin:reg-trend";
const ADMIN_TTL = 120;

export async function GetRegistrationTrendService() {
  try {
    const cached = await cacheGet<any>(ADMIN_REG_TREND);
    if (cached) return { code: 200, status: "success", message: "Registration trend retrieved successfully", data: cached };

    const trend = await adminRepo.getRegistrationTrend();
    const data = { trend };
    await cacheSet(ADMIN_REG_TREND, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Registration trend retrieved successfully", data };
  } catch (error) {
    console.error("GetRegistrationTrendService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registration trend" };
  }
}
