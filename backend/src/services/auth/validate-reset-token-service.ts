import { AuthRepository } from "@/repositories/auth.repository";

const authRepo = new AuthRepository();

export async function ValidateResetTokenService(token: string) {
  try {
    const tokenRecord = await authRepo.findToken(token, "PASSWORD_RESET");

    if (!tokenRecord) {
      return { code: 400, status: "error", message: "Invalid reset token" };
    }

    if (tokenRecord.consumedAt) {
      return { code: 400, status: "error", message: "This reset link has already been used" };
    }

    if (tokenRecord.revokedAt) {
      return { code: 400, status: "error", message: "This reset link has been revoked" };
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      return { code: 400, status: "error", message: "This reset link has expired" };
    }

    return {
      code: 200,
      status: "success",
      message: "Reset token is valid",
    };
  } catch (error) {
    console.error("ValidateResetTokenService error", error);
    return { code: 500, status: "error", message: "Unable to validate reset token" };
  }
}
