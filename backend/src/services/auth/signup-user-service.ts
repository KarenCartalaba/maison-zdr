import crypto from "crypto";
import { AuthRepository } from "@/repositories/auth.repository";
import { hashPassword } from "@/utils/password";
import { renderTemplate } from "@/utils/template";
import { sendEmailWithTimeout } from "@/lib/nodemailer";
import { cacheInvalidatePattern } from "@/lib/redis";

const authRepo = new AuthRepository();

export async function SignupUserService(name: string, email: string, password: string) {
  try {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const existing = await authRepo.findUserByEmail(email);
    if (existing) {
      return { code: 409, status: "error", message: "Email already registered" };
    }

    const created = await authRepo.createUser({ name, email, password: hashPassword(password) });

    // Invalidate admin users cache so new user appears immediately
    await cacheInvalidatePattern("admin:users:*");

    await authRepo.createToken({ type: "EMAIL_VERIFY", token, expiresAt, userId: created.id });

    const emailVerificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const html = renderTemplate("verify-email.html", {
      name: created.name ?? "there",
      emailVerificationURL,
      expiresAt: expiresAt.toUTCString(),
    });

    await sendEmailWithTimeout({
      to: created.email ?? email,
      subject: "Verify your email address",
      html,
    }).catch((err) => console.error("Failed to send verification email:", err));

    const { password: _, ...safeUser } = created;
    return {
      code: 201,
      status: "success",
      message: "Account created successfully! Please verify your email.",
      data: { user: safeUser },
    };
  } catch (error) {
    console.error("SignupUserService error", error);
    return { code: 500, status: "error", message: "Unable to create account" };
  }
}
