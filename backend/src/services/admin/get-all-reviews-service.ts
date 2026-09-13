import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_TTL = 120;

export async function GetAllReviewsService(filters?: { status?: string; search?: string }) {
  try {
    const key = `admin:reviews:${filters?.status || "ALL"}:${filters?.search || ""}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Reviews retrieved successfully", data: cached };

    const [reviews, stats] = await Promise.all([
      adminRepo.getAllReviews(filters),
      adminRepo.getReviewStats(),
    ]);
    const data = { reviews, stats };
    await cacheSet(key, data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Reviews retrieved successfully", data };
  } catch (error) {
    console.error("GetAllReviewsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve reviews" };
  }
}
