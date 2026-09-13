import { ENV } from "@/config/env";
import nodemailer, { Transporter } from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

let transporter: Transporter | null = null;

function buildTransporter(): Transporter {
  if (!ENV.SMTP.HOST || !ENV.SMTP.PORT) {
    throw new Error("SMTP.HOST and SMTP.PORT must be configured");
  }

  if (!ENV.SMTP.USER || !ENV.SMTP.PASS) {
    throw new Error("SMTP.USER and SMTP.PASSWORD must be configured");
  }

  return nodemailer.createTransport({
    host: ENV.SMTP.HOST,
    port: Number(ENV.SMTP.PORT),
    auth: {
      user: ENV.SMTP.USER,
      pass: ENV.SMTP.PASS,
    },
  });
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = buildTransporter();
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!ENV.SMTP.FROM || !ENV.APP_NAME) {
    throw new Error("SMTP.FROM / APP.NAME must be configured");
  }

  await getTransporter().sendMail({
    from: `"${ENV.APP_NAME}" <${ENV.SMTP.FROM}>`,
    to,
    subject,
    html,
  });
}

export const sendEmailWithTimeout = async ({ to, subject, html }: SendEmailParams, timeoutMs = 30000) => {
  return Promise.race([
    sendEmail({ to, subject, html }),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("SMTP timeout")), timeoutMs)
    ),
  ]);
};
