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

On Render free tier, the first SMTP connection after cold start takes minutes. Two problems:

1. **`await sendEmail`** blocks the HTTP response — causes 500 errors after long loading
2. **`sendEmailWithTimeout` with short timeout** (5s) kills the SMTP connection before it can establish — email never sends

### Solution: Fire-and-forget `sendEmail` (no timeout)

All user-facing emails use `sendEmail` without `await` and without a timeout. The response is instant, and the email sends in the background — even if SMTP cold start takes minutes.

```typescript
// No await, no timeout — sends in background, Gmail keeps the connection alive
sendEmail({ to, subject, html }).catch(console.error);
```

### Which emails use this pattern

| Email type | Pattern | Why |
|-----------|---------|-----|
| Signup verification | Fire-and-forget `sendEmail` | Account already created |
| Resend verification | Fire-and-forget `sendEmail` | Token already created |
| Registration confirmation | Fire-and-forget `sendEmail` | User can check My Registrations |
| Cancellation | Fire-and-forget `sendEmail` | Registration already cancelled |
| Forgot password | Fire-and-forget `sendEmail` | Token already created |
| Contact form | Fire-and-forget `sendEmail` | Message saved to DB |
| Event reminders | `await sendEmail` | Cron job — needs sent/failed tracking |

### Key principle

**Never let SMTP block the user's HTTP response.** The database write (user account, registration, token) always happens first. The email is a secondary action that can retry.
