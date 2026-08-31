# Email — Resend

## Provider

**Resend** (HTTPS email API): https://resend.com

- Free tier: 100 emails/day, 3000/month
- No SMTP ports needed — uses HTTPS (port 443)
- Works on Render free tier (which blocks SMTP ports 25, 465, 587)

## Environment Variables

```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="Maison ZDR <onboarding@resend.dev>"
```

### Custom domain (production)

For production, verify your own domain in Resend dashboard and update `EMAIL_FROM`:

```env
EMAIL_FROM="Maison ZDR <noreply@yourdomain.com>"
```

Domain verification requires adding DNS records (SPF, DKIM, DMARC) provided by Resend.

## Setup

Uses `resend` SDK — pure HTTPS, no SMTP involved:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "Maison ZDR <onboarding@resend.dev>",
  to: ["user@example.com"],
  subject: "Hello",
  html: "<p>Welcome!</p>",
});
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
npm install resend
```

## Why Not Nodemailer?

Render free tier blocks outbound SMTP ports (25, 465, 587) since September 2025. Nodemailer requires SMTP — it cannot work on Render free tier. Resend uses HTTPS (port 443) which is never blocked.
