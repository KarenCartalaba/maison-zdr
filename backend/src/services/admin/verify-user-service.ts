import { AdminRepository } from "@/repositories/admin.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const adminRepo = new AdminRepository();
const authRepo = new AuthRepository();

export async function VerifyUserService(id: string) {
  try {
    const user = await authRepo.findUserById(id);
    if (!user) return { code: 404, status: "error", message: "User not found" };

    const updated = await adminRepo.verifyUser(id);
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "User verified successfully", data: { user: { id: updated.id, name: updated.name, email: updated.email, emailVerified: updated.emailVerified } } };
  } catch (error) {
    console.error("VerifyUserService error", error);
    return { code: 500, status: "error", message: "Unable to verify user" };
  }
}
