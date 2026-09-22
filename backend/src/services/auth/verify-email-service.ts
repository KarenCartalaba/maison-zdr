import { AuthRepository } from "@/repositories/auth.repository";
import { invalidateUserCache } from "./get-me-service";

const authRepo = new AuthRepository();

const GENERIC_INVALID = "Invalid or expired verification link";

export async function VerifyEmailService(token: string) {
  try {
    const record = await authRepo.findToken(token, "EMAIL_VERIFY");
    if (!record) {
      return { code: 400, status: "error", message: GENERIC_INVALID };
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await authRepo.revokeToken(record.id);
      return { code: 400, status: "error", message: GENERIC_INVALID };
    }

    const user = await authRepo.findUserById(record.userId);
    if (!user) {
      await authRepo.revokeToken(record.id);
      return { code: 400, status: "error", message: GENERIC_INVALID };
    }

    if (user.emailVerified) {
      return { code: 200, status: "success", message: "Email already verified" };
    }

    await authRepo.updateUser(user.id, { emailVerified: new Date() });
    await authRepo.consumeToken(record.id);
    await invalidateUserCache(user.id);

    return {
      code: 200,
      status: "success",
      message: "Email verified successfully!",
    };
  } catch (error) {
    console.error("VerifyEmailService error", error);
    return { code: 500, status: "error", message: "Unable to verify account" };
  }
}
