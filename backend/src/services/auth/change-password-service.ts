import { AuthRepository } from "@/repositories/auth.repository";
import { verifyPassword, hashPassword } from "@/utils/password";

const authRepo = new AuthRepository();

export async function ChangePasswordService(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await authRepo.findUserById(userId);
    if (!user) return { code: 404, status: "error", message: "User not found" };

    const isMatch = verifyPassword(currentPassword, user.password);
    if (!isMatch) return { code: 400, status: "error", message: "Current password is incorrect" };

    const hashedPassword = hashPassword(newPassword);
    await authRepo.updateUserPassword(userId, hashedPassword);

    return { code: 200, status: "success", message: "Password changed successfully" };
  } catch (error) {
    console.error("ChangePasswordService error", error);
    return { code: 500, status: "error", message: "Unable to change password" };
  }
}
