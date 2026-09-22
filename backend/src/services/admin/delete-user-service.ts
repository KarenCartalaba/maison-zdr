import { AdminRepository } from "@/repositories/admin.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const adminRepo = new AdminRepository();
const authRepo = new AuthRepository();

export async function DeleteUserService(id: string, callerId?: string) {
  try {
    const user = await authRepo.findUserById(id);
    if (!user) return { code: 404, status: "error", message: "User not found" };

    // Block self-deletion
    if (callerId && callerId === id) {
      return { code: 400, status: "error", message: "Cannot delete yourself" };
    }

    if (user.role === "ADMIN") return { code: 400, status: "error", message: "Cannot delete an admin user" };

    await adminRepo.deleteUser(id);
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "User deleted successfully" };
  } catch (error) {
    console.error("DeleteUserService error", error);
    return { code: 500, status: "error", message: "Unable to delete user" };
  }
}
