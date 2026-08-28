import { AuthRepository } from "@/repositories/auth.repository";
import { cacheGet, cacheSet, cacheInvalidate } from "@/lib/redis";

const authRepo = new AuthRepository();

const USER_BY_ID = (id: string) => `user:${id}`;
const USER_TTL = 600; // 10 min

export async function GetMeService(userId: string) {
  try {
    // Check cache first
    const cached = await cacheGet<any>(USER_BY_ID(userId));
    if (cached) {
      return { code: 200, status: "success", data: { user: cached } };
    }

    const user = await authRepo.findUserById(userId);

    if (!user) {
      return { code: 404, status: "error", message: "User not found" };
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    await cacheSet(USER_BY_ID(userId), userData, USER_TTL);

    return {
      code: 200,
      status: "success",
      data: { user: userData },
    };
  } catch (error) {
    console.error("GetMeService Error", error);
    return { code: 500, status: "error", message: "Failed to fetch user data" };
  }
}

/**
 * Invalidate user cache. Call this when user profile is updated.
 */
export async function invalidateUserCache(userId: string) {
  await cacheInvalidate(USER_BY_ID(userId));
}
