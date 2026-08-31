import { AuthRepository } from "@/repositories/auth.repository";
import { hashPassword } from "@/utils/password";

const authRepo = new AuthRepository();

export async function ResetPasswordService(token: string, password: string) {
  try {
    const tokenRecord = await authRepo.findToken(token, "PASSWORD_RESET");

    if (!tokenRecord) {
      return { code: 400, status: "error", message: "Invalid or expired reset token" };
    }

    if (tokenRecord.consumedAt) {
      return { code: 400, status: "error", message: "Reset token has already been used" };
    }

    if (tokenRecord.revokedAt) {
      return { code: 400, status: "error", message: "Reset token has been revoked" };
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      return { code: 400, status: "error", message: "Reset token has expired" };
    }

    await authRepo.updateUserPassword(tokenRecord.userId, hashPassword(password));
    await authRepo.consumeToken(tokenRecord.id);

    return {
      code: 200,
      status: "success",
      message: "Password has been reset successfully",
    };
  } catch (error) {
    console.error("ResetPasswordService error", error);
    return { code: 500, status: "error", message: "Unable to reset password" };
  }
}
