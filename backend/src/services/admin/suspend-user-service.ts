import { AuthRepository } from "@/repositories/auth.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const authRepo = new AuthRepository();

export async function SuspendUserService(userId: string, callerId?: string) {
  try {
    const user = await authRepo.findUserById(userId);
    if (!user) return { code: 404, status: "error", message: "User not found" };

    // Block self-suspension
    if (callerId && callerId === userId) {
      return { code: 400, status: "error", message: "Cannot suspend yourself" };
    }

    if (user.role === "ADMIN") return { code: 400, status: "error", message: "Cannot suspend an admin" };

    const updated = await authRepo.setSuspended(userId, !user.suspended);

    await cacheInvalidatePattern("admin:*");

    return {
      code: 200,
      status: "success",
      message: updated.suspended ? "User suspended" : "User unsuspended",
      data: { suspended: updated.suspended },
    };
  } catch (error) {
    console.error("SuspendUserService error", error);
    return { code: 500, status: "error", message: "Unable to update user status" };
  }
}
