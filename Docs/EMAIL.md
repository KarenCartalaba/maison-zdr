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

| Type | Trigger | Template | Strategy |
|------|---------|----------|----------|
| Email verification | Signup | `verify-email.html` | `sendEmailWithTimeout` (fire-and-forget) |
| Password reset | Forgot password | `password-reset.html` | `sendEmailWithTimeout` (fire-and-forget) |
| Event registration | Registration | `event-registration.html` | Fire-and-forget |
| Event cancellation | Cancellation | `event-cancellation.html` | Fire-and-forget |
| Event reminder | Cron job (hourly) | `event-reminder.html` | `await sendEmail` |

All templates use a unified styled design: green header (`#1a5c2a`), card layout, CTA buttons, info callouts, and footer.

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

On Render free tier, SMTP connections to Gmail take minutes on cold start. The challenge:

- `await sendEmail` blocks the response → 500 errors after minutes of loading
- Fire-and-forget `sendEmail` → Render may sleep the process before SMTP completes
- `sendEmailWithTimeout` with short timeout (5s) → kills connection before SMTP establishes

### Solution: `await sendEmailWithTimeout` with 30s timeout

Critical emails (signup verification, resend verification) use `await sendEmailWithTimeout()` with a 30-second timeout. The user waits up to 30s (instead of minutes), and the process stays alive long enough for SMTP to complete.

```typescript
export const sendEmailWithTimeout = async (opts, timeoutMs = 30000) => {
  return Promise.race([
    sendEmail(opts),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("SMTP timeout")), timeoutMs)
    ),
  ]);
};
```

### Which emails use which pattern

| Email type | Pattern | Why |
|-----------|---------|-----|
| Signup verification | `await sendEmailWithTimeout` (30s) | Critical — user needs it to verify |
| Resend verification | `await sendEmailWithTimeout` (30s) | Critical — user explicitly requested it |
| Registration confirmation | Fire-and-forget `sendEmail` | Nice-to-have — user can check My Registrations |
| Cancellation | Fire-and-forget `sendEmail` | Nice-to-have |
| Forgot password | Fire-and-forget `sendEmail` | Token already created |
| Contact form | Fire-and-forget `sendEmail` | Message saved to DB |
| Event reminders | `await sendEmail` | Cron job — needs sent/failed tracking |

### Key principle

**Critical emails that gate user action** (signup, resend verification) must `await` with a timeout so the SMTP connection completes. **Non-critical emails** can fire-and-forget since the DB write already happened.
