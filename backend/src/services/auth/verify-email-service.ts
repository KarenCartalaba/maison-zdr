import { AuthRepository } from "@/repositories/auth.repository";

const authRepo = new AuthRepository();

export async function VerifyEmailService(token: string) {
  try {
    const record = await authRepo.findToken(token, "EMAIL_VERIFY");
    if (!record) {
      return { code: 404, status: "error", message: "Verification token not found" };
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await authRepo.revokeToken(record.id);
      return { code: 410, status: "error", message: "Verification token expired" };
    }

    const user = await authRepo.findUserById(record.userId);
    if (!user) {
      await authRepo.revokeToken(record.id);
      return { code: 404, status: "error", message: "User not found for this token" };
    }

    if (user.emailVerified) {
      return { code: 200, status: "success", message: "Email already verified" };
    }

    await authRepo.updateUser(user.id, { emailVerified: new Date() });
    await authRepo.consumeToken(record.id);

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
