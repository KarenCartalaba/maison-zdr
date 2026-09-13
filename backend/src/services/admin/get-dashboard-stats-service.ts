import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_STATS = "admin:stats";
const ADMIN_TTL = 120;

export async function GetDashboardStatsService() {
  try {
    const cached = await cacheGet<any>(ADMIN_STATS);
    if (cached) return { code: 200, status: "success", message: "Dashboard stats retrieved successfully", data: cached };

    const [totalEvents, totalRegistrations, ongoingEvents, cancelledEvents] =
      await Promise.all([
        adminRepo.countAllEvents(),
        adminRepo.countAllRegistrations(),
        adminRepo.countOngoingEvents(),
        adminRepo.countCancelledEvents(),
      ]);

    const data = { totalEvents, totalRegistrations, ongoingEvents, cancelledEvents };
    await cacheSet(ADMIN_STATS, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Dashboard stats retrieved successfully", data };
  } catch (error) {
    console.error("GetDashboardStatsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve dashboard stats" };
  }
}
