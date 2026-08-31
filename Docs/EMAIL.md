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

Uses `nodemailer` with transport configuration:

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});
```

## Email Types

| Type | Trigger | Template |
|------|---------|----------|
| Email verification | Signup | Link to `/verify-email?token=xxx` |
| Password reset | Forgot password | Link to `/reset-password?token=xxx` |
| Event reminder | Cron job (hourly) | Event details + registration link |

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

## SMTP Timeout Issue (Render Free Tier)

On Render free tier, the first SMTP connection after cold start takes minutes. If `sendEmail` is `await`ed in a user-facing route, the HTTP response is blocked until SMTP connects or times out — causing 500 errors after long loading.

### Solution: Two strategies in `src/lib/nodemailer.ts`

**1. `sendEmailWithTimeout`** — for critical emails (signup verification, resend verification). Races the SMTP call against a 5s timeout. User still gets an immediate response even if SMTP is slow.

```typescript
export const sendEmailWithTimeout = async (opts, timeoutMs = 5000) => {
  return Promise.race([
    sendEmail(opts),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("SMTP timeout")), timeoutMs)
    ),
  ]);
};
```

**2. Fire-and-forget `sendEmail`** — for non-critical emails (registration confirmation, cancellation, forgot password, contact form). The email sends in the background without blocking the response.

```typescript
// No await — sends in background
sendEmail({ to, subject, html }).catch(console.error);
```

### Which strategy is used where

| Email type | Strategy | Why |
|-----------|----------|-----|
| Signup verification | `sendEmailWithTimeout` (fire-and-forget) | Critical — but account is already created |
| Resend verification | `sendEmailWithTimeout` (fire-and-forget) | Critical — token is already created |
| Registration confirmation | Fire-and-forget | Nice-to-have — user can check My Registrations |
| Cancellation | Fire-and-forget | Nice-to-have |
| Forgot password | Fire-and-forget | Token is created regardless |
| Contact form | Fire-and-forget | Message saved to DB regardless |
| Event reminders | `await sendEmail` | Cron job — needs sent/failed tracking |

### Key principle

**Never let SMTP block the user's HTTP response.** The database write (user account, registration, token) always happens first. The email is a secondary action that can retry.
