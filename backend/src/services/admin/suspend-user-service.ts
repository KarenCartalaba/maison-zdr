import { AdminRepository } from "@/repositories/admin.repository";
import { cacheInvalidatePattern } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const adminRepo = new AdminRepository();

export async function SuspendUserService(userId: string) {
  try {
    const user = await adminRepo.findUserById(userId);
    if (!user) return { code: 404, status: "error", message: "User not found" };
    if (user.role === "ADMIN") return { code: 400, status: "error", message: "Cannot suspend an admin" };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { suspended: !user.suspended },
    });

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
