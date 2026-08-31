import crypto from "crypto";
import { AuthRepository } from "@/repositories/auth.repository";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/email";
import { ENV } from "@/config/env";

const authRepo = new AuthRepository();

export async function ForgotPasswordService(email: string) {
  try {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { code: 200, status: "success", message: "If an account exists with that email, you will receive a password reset link." };
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepo.createToken({
      type: "PASSWORD_RESET",
      token,
      expiresAt,
      userId: user.id,
    });

    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;

    const html = renderTemplate("password-reset.html", {
      name: user.name ?? "there",
      resetUrl,
      expiresAt: expiresAt.toUTCString(),
    });

    sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html,
    }).catch((err) => console.error("Failed to send password reset email:", err));

    return {
      code: 200,
      status: "success",
      message: "If an account exists with that email, you will receive a password reset link.",
    };
  } catch (error) {
    console.error("ForgotPasswordService error", error);
    return { code: 500, status: "error", message: "Unable to process password reset request" };
  }
}
