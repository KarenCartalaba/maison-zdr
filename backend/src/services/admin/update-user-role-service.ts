import { AdminRepository } from "@/repositories/admin.repository";
import { cacheInvalidatePattern } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const adminRepo = new AdminRepository();

export async function UpdateUserRoleService(id: string, role: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { code: 404, status: "error", message: "User not found" };

    const updated = await adminRepo.updateUserRole(id, role);
    await cacheInvalidatePattern("admin:users:*");
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "User role updated", data: { user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } } };
  } catch (error) {
    console.error("UpdateUserRoleService error", error);
    return { code: 500, status: "error", message: "Unable to update user role" };
  }
}
