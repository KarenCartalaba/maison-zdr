import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_ATTENDANCE = "admin:attendance";
const ADMIN_TTL = 120;

export async function GetAttendanceTrendService() {
  try {
    const cached = await cacheGet<any>(ADMIN_ATTENDANCE);
    if (cached) return { code: 200, status: "success", message: "Attendance trend retrieved successfully", data: cached };

    const trend = await adminRepo.getAttendanceTrend();
    const data = { trend };
    await cacheSet(ADMIN_ATTENDANCE, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Attendance trend retrieved successfully", data };
  } catch (error) {
    console.error("GetAttendanceTrendService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve attendance trend" };
  }
}
