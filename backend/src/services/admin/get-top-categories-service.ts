import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_CATEGORIES = "admin:categories";
const ADMIN_TTL = 120;

export async function GetTopCategoriesService() {
  try {
    const cached = await cacheGet<any>(ADMIN_CATEGORIES);
    if (cached) return { code: 200, status: "success", message: "Top categories retrieved successfully", data: cached };

    const categories = await adminRepo.getTopCategories();
    const data = { categories };
    await cacheSet(ADMIN_CATEGORIES, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Top categories retrieved successfully", data };
  } catch (error) {
    console.error("GetTopCategoriesService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve top categories" };
  }
}
