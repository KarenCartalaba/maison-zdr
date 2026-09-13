import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TTL = 120;

export async function GetAllUsersService(filters?: { role?: string; search?: string }) {
  try {
    const key = `admin:users:${filters?.role || "ALL"}:${filters?.search || ""}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Users retrieved successfully", data: cached };

    const [users, stats] = await Promise.all([
      adminRepo.getAllUsers(filters),
      adminRepo.getUserStats(),
    ]);
    const data = { users, stats };
    await cacheSet(key, data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Users retrieved successfully", data };
  } catch (error) {
    console.error("GetAllUsersService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve users" };
  }
}
