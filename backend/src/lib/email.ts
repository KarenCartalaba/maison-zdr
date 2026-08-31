import { Resend } from "resend";
import { ENV } from "@/config/env";

const resend = new Resend(ENV.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  return resend.emails.send({
    from: ENV.EMAIL.FROM,
    to: [to],
    subject,
    html,
  });
};

export const sendEmailWithTimeout = async ({ to, subject, html }: SendEmailOptions, timeoutMs = 30000) => {
  return Promise.race([
    sendEmail({ to, subject, html }),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Email timeout")), timeoutMs)
    ),
  ]);
};
