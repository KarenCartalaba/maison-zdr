import { Resend } from "resend";
import { ENV } from "@/config/env";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
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
  return `"${ENV.APP_NAME}" <${ENV.EMAIL.FROM}>`;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const { error } = await getResend().emails.send({
    from: getFrom(),
    to,
    subject,
    html,
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
