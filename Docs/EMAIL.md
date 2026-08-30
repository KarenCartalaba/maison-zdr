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
