import { AdminRepository } from "@/repositories/admin.repository";
import { cacheInvalidatePattern } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const adminRepo = new AdminRepository();

export async function DeleteUserService(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { code: 404, status: "error", message: "User not found" };
    if (user.role === "ADMIN") return { code: 400, status: "error", message: "Cannot delete an admin user" };

    await adminRepo.deleteUser(id);
    await cacheInvalidatePattern("admin:users:*");
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "User deleted successfully" };
  } catch (error) {
    console.error("DeleteUserService error", error);
    return { code: 500, status: "error", message: "Unable to delete user" };
  }
}
