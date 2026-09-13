import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TTL = 120;

export async function GetAnalyticsOverviewService() {
  try {
    const cached = await cacheGet<any>("admin:analytics");
    if (cached) return { code: 200, status: "success", message: "Analytics retrieved successfully", data: cached };

    const data = await adminRepo.getAnalyticsOverview();
    await cacheSet("admin:analytics", data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Analytics retrieved successfully", data };
  } catch (error) {
    console.error("GetAnalyticsOverviewService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve analytics" };
  }
}
