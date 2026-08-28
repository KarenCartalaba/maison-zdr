import nodemailer from "nodemailer";
import { ENV } from "@/config/env";

const transporter = nodemailer.createTransport({
  host: ENV.SMTP.HOST,
  port: ENV.SMTP.PORT,
  secure: false,
  auth: {
    user: ENV.SMTP.USER,
    pass: ENV.SMTP.PASS,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const info = await transporter.sendMail({
    from: ENV.SMTP.FROM,
    to,
    subject,
    html,
  });
  return info;
};
