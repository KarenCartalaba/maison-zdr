import { AdminRepository } from "@/repositories/admin.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const adminRepo = new AdminRepository();
const authRepo = new AuthRepository();

export async function UpdateUserRoleService(id: string, role: string, callerId?: string) {
  try {
    const user = await authRepo.findUserById(id);
    if (!user) return { code: 404, status: "error", message: "User not found" };

    // Block self-demotion to non-admin role
    if (callerId && callerId === id && role !== "ADMIN") {
      return { code: 400, status: "error", message: "Cannot demote yourself from admin" };
    }

    // Block demoting another ADMIN unless caller is ADMIN and at least one other active ADMIN remains
    if (user.role === "ADMIN" && role !== "ADMIN") {
      if (!callerId) {
        return { code: 403, status: "error", message: "Forbidden" };
      }
      const caller = await authRepo.findUserById(callerId);
      if (!caller || caller.role !== "ADMIN") {
        return { code: 403, status: "error", message: "Only admins can demote other admins" };
      }
      // Count active (non-suspended) admins excluding the target
      const otherActiveAdmins = await authRepo.countActiveAdmins(id);
      if (otherActiveAdmins < 1) {
        return { code: 400, status: "error", message: "Cannot demote the only active admin" };
      }
    }

    const updated = await adminRepo.updateUserRole(id, role);
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "User role updated", data: { user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } } };
  } catch (error) {
    console.error("UpdateUserRoleService error", error);
    return { code: 500, status: "error", message: "Unable to update user role" };
  }
}
