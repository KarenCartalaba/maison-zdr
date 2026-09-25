import crypto from "crypto";
import { AuthRepository } from "@/repositories/auth.repository";
import { renderTemplate } from "@/utils/template";
import { sendEmailWithTimeout } from "@/lib/email";

const authRepo = new AuthRepository();

const GENERIC_SUCCESS = "If an account with that email exists, a verification link has been sent.";

export async function ResendEmailVerificationService(email: string) {
  try {
    const user = await authRepo.findUserByEmail(email);

    // Unknown email returns the same shaped response as a known one to prevent
    // email-enumeration attacks.
    if (!user) {
      return { code: 200, status: "success", message: GENERIC_SUCCESS };
    }

    if (user.emailVerified) {
      return { code: 200, status: "success", message: GENERIC_SUCCESS };
    }

    const previousToken = await authRepo.findTokenByUser(user.id, "EMAIL_VERIFY");
    if (previousToken && previousToken.consumedAt) {
      return { code: 200, status: "success", message: GENERIC_SUCCESS };
    }

    if (previousToken && previousToken.expiresAt.getTime() > Date.now()) {
      return { code: 200, status: "success", message: GENERIC_SUCCESS };
    }

    if (previousToken) {
      await authRepo.revokeToken(previousToken.id);
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await authRepo.createToken({ type: "EMAIL_VERIFY", token, expiresAt, userId: user.id });

    const emailVerificationURL = `${process.env.BACKEND_URL}/api/auth/v1/verify-email?token=${encodeURIComponent(token)}`;

    const html = renderTemplate("verify-email.html", {
      name: user.name ?? "there",
      emailVerificationURL,
      expiresAt: expiresAt.toUTCString(),
    });

    await sendEmailWithTimeout({
      to: user.email ?? email,
      subject: "Verify your email address",
      html,
    }).catch((err) => console.error("Failed to resend verification email:", err));

    return {
      code: 200,
      status: "success",
      message: GENERIC_SUCCESS,
    };
  } catch (error) {
    console.error("ResendEmailVerificationService error", error);
    return { code: 500, status: "error", message: "Unable to resend verification email" };
  }
}
