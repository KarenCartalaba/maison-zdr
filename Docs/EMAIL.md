# Email — Nodemailer

## Provider

**Gmail SMTP** (for testing/development): https://support.google.com/mail/answer/7126229

For production, use a dedicated email service (SendGrid, Mailgun, AWS SES).

## Environment Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

> **Note**: Gmail requires an App Password (not your regular password).
> Go to Google Account > Security > 2-Step Verification > App passwords.

## Setup

Uses `nodemailer` with a lazily-initialized transporter (see `src/lib/nodemailer.ts`):

```typescript
import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function buildTransporter(): Transporter {
  if (!ENV.SMTP.HOST || !ENV.SMTP.PORT) {
    throw new Error("SMTP_HOST and SMTP_PORT must be configured");
  }
  if (!ENV.SMTP.USER || !ENV.SMTP.PASS) {
    throw new Error("SMTP_USER and SMTP_PASSWORD must be configured");
  }
  return nodemailer.createTransport({
    host: ENV.SMTP.HOST,
    port: ENV.SMTP.PORT,
    secure: false,
    auth: { user: ENV.SMTP.USER, pass: ENV.SMTP.PASS },
  });
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = buildTransporter();
  }
  return transporter;
}

export const sendEmail = async ({ to, subject, html }) => {
  await getTransporter().sendMail({
    from: `"${ENV.APP_NAME}" <${ENV.SMTP.FROM}>`,
    to,
    subject,
    html,
  });
};
```

## Email Types

| Type | Trigger | Template | Strategy |
|------|---------|----------|----------|
| Email verification | Signup | `verify-email.html` | `sendEmailWithTimeout` (30s) |
| Password reset | Forgot password | `password-reset.html` | `sendEmailWithTimeout` (30s) |
| Event registration | Registration | `event-registration.html` | Fire-and-forget |
| Event cancellation | Cancellation | `event-cancellation.html` | Fire-and-forget |
| Event reminder | Cron job (hourly) | `event-reminder.html` | `await sendEmail` |

All templates use a unified styled design: green header (`#1a5c2a`), card layout, CTA buttons, info callouts, and footer.

## Sending Strategies

| Email type | Pattern | Why |
|-----------|---------|-----|
| Signup verification | `await sendEmailWithTimeout` (30s) | Critical — user needs it to verify |
| Resend verification | `await sendEmailWithTimeout` (30s) | Critical — user explicitly requested it |
| Registration confirmation | Fire-and-forget `sendEmail` | Nice-to-have — user can check My Registrations |
| Cancellation | Fire-and-forget `sendEmail` | Nice-to-have |
| Forgot password | Fire-and-forget `sendEmail` | Token already created |
| Contact form | Fire-and-forget `sendEmail` | Message saved to DB |
| Event reminders | `await sendEmail` | Cron job — needs sent/failed tracking |

**Key principle**: Critical emails that gate user action (signup, resend verification) must `await` with a timeout. Non-critical emails can fire-and-forget since the DB write already happened.

## Event Reminder Cron

Runs hourly via `node-cron`:

```typescript
cron.schedule("0 * * * *", async () => {
  // Check events happening in next 24 hours
  // Skip if user already received reminder (Redis dedup)
  // Send reminder email
});
```

Deduplication uses Redis keys: `reminder:{userId}:{eventId}` with 24h TTL.

## Frontend Integration

Email-related pages:
- `/verify-email` — Handles verification link callback
- `/forgot-password` — Request password reset
- `/reset-password` — Set new password

## Package

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

## Render Free Tier Limitation

Render free tier blocks outbound SMTP ports (25, 465, 587) since September 2025. SMTP email works locally and on paid Render instances (or platforms without port blocking). If staying on Render free tier, the alternative is an HTTPS email API (e.g. Resend) — but the codebase itself uses Nodemailer, which is correct wherever SMTP is allowed.
