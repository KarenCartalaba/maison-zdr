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

Uses `nodemailer` with transport configuration and a custom `getSocket` to force IPv4 (Render doesn't support IPv6):

```typescript
import dns from "dns";
import net from "net";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: { rejectUnauthorized: true },
  getSocket: (options: any, callback: any) => {
    dns.resolve4(options.host, (err: any, addresses: string[]) => {
      if (err) return callback(err);
      const socket = net.createConnection({ host: addresses[0], port: options.port });
      callback(null, { socket, host: options.host });
    });
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

## SMTP on Render (IPv6 Fix)

Render does not support IPv6. Nodemailer resolves hostnames via `dns.resolve4()` + `dns.resolve6()` independently and picks a random address — if IPv6 is picked, the connection fails with `ENETUNREACH` or hangs until timeout.

**`family: 4` does NOT work** — nodemailer never forwards it to the DNS resolver or `net.connect()`.

### Solution: `getSocket` with `dns.resolve4()`

Use the `getSocket` option to resolve only A records (IPv4) and create the TCP socket directly. This bypasses nodemailer's built-in DNS resolver entirely. See `src/lib/nodemailer.ts`.

### Email sending strategies

`await sendEmailWithTimeout` with 30s timeout for critical emails (signup, resend verification). Non-critical emails use fire-and-forget `sendEmail`.

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
