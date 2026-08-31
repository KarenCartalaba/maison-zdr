import dns from "dns";
import net from "net";
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
  tls: { rejectUnauthorized: true },
  getSocket: (options: any, callback: any) => {
    dns.resolve4(options.host, (err: any, addresses: string[]) => {
      if (err) return callback(err);
      const socket = net.createConnection({ host: addresses[0], port: options.port });
      callback(null, { socket, host: options.host });
    });
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

export const sendEmailWithTimeout = async ({ to, subject, html }: SendEmailOptions, timeoutMs = 30000) => {
  return Promise.race([
    sendEmail({ to, subject, html }),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("SMTP timeout")), timeoutMs)
    ),
  ]);
};
