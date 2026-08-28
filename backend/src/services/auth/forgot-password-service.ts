import { AuthRepository } from "@/repositories/auth.repository";
import { hashPassword } from "@/utils/password";
import { sendEmail } from "@/lib/nodemailer";
import { ENV } from "@/config/env";

const authRepo = new AuthRepository();

export async function ForgotPasswordService(email: string) {
  try {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { code: 200, status: "success", message: "If an account exists with this email, you will receive a password reset link." };
    }

    // Generate a simple token (in production, use JWT or crypto)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    await authRepo.createToken({
      type: "PASSWORD_RESET",
      token,
      expiresAt,
      userId: user.id,
    });

    // Send email (don't block on failure)
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;
    sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    }).catch(console.error);

    return {
      code: 200,
      status: "success",
      message: "If an account exists with this email, you will receive a password reset link.",
    };
  } catch (error) {
    console.error("ForgotPasswordService error", error);
    return { code: 500, status: "error", message: "Unable to process password reset request" };
  }
}
