import { Resend } from "resend";
import { ENV } from "@/config/env";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  /** Lets the recipient reply straight to the original sender. */
  replyTo?: string;
};

let resend: Resend | null = null;

function getResend(): Resend {
  if (!ENV.EMAIL.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY must be configured");
  }
  if (!resend) {
    resend = new Resend(ENV.EMAIL.RESEND_API_KEY);
  }
  return resend;
}

function getFrom(): string {
  if (!ENV.EMAIL.FROM || !ENV.APP_NAME) {
    throw new Error("EMAIL_FROM / APP_NAME must be configured");
  }
  // EMAIL_FROM may already carry a display name ("Maison ZDR <a@x.com>").
  // Wrapping that again would produce a malformed address, so only add the
  // APP_NAME prefix when it looks like a bare address.
  if (ENV.EMAIL.FROM.includes("<")) {
    return ENV.EMAIL.FROM;
  }
  return `"${ENV.APP_NAME}" <${ENV.EMAIL.FROM}>`;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  const { error } = await getResend().emails.send({
    from: getFrom(),
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

export const sendEmailWithTimeout = async ({ to, subject, html }: SendEmailParams, timeoutMs = 30000) => {
  return Promise.race([
    sendEmail({ to, subject, html }),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Email send timeout")), timeoutMs)
    ),
  ]);
};
