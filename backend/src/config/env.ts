import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

// ── Fail-fast validation for required secrets ────────────────────────────────
const requiredEnvSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required'),
});

const parsed = requiredEnvSchema.safeParse(process.env);
if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('\n  ');
  throw new Error(
    `Missing or invalid required environment variables:\n  ${missing}\n` +
    'Server cannot start without these values. Please set them and restart.',
  );
}

// ── Warn (but do not crash) on optional variables ───────────────────────────
const optionalWarnings: string[] = [];
if (!process.env.SMTP_HOST) optionalWarnings.push('SMTP_HOST');
if (!process.env.SMTP_USER) optionalWarnings.push('SMTP_USER');
if (!process.env.SMTP_PASSWORD) optionalWarnings.push('SMTP_PASSWORD');
if (!process.env.CLOUDINARY_CLOUD_NAME) optionalWarnings.push('CLOUDINARY_CLOUD_NAME');
if (!process.env.CLOUDINARY_API_KEY) optionalWarnings.push('CLOUDINARY_API_KEY');
if (!process.env.CLOUDINARY_SECRET_KEY) optionalWarnings.push('CLOUDINARY_SECRET_KEY');
if (!process.env.GOOGLE_CLIENT_ID) optionalWarnings.push('GOOGLE_CLIENT_ID');
if (optionalWarnings.length > 0) {
  console.warn(`⚠️  Optional environment variables not set: ${optionalWarnings.join(', ')}`);
}

// ── Typed export ────────────────────────────────────────────────────────────
export const ENV = {
  APP_NAME: process.env.APP_NAME || 'Zone De Rassemblement',
  PORT: parseInt(process.env.PORT || '8000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASSWORD,
    FROM: process.env.SMTP_FROM,
  },

  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY,
};
