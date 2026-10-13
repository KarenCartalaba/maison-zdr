# Email — Resend

## Provider

**Resend** (HTTPS email API): https://resend.com

Chosen over Gmail SMTP because Render's free tier blocks outbound SMTP ports
(25, 465, 587). Resend works over plain HTTPS on every plan.

## Environment Variables

```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="notifications@yourdomain.com"
EMAIL_TO="contact@yourdomain.com"
```

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Sending-only API key from https://resend.com/api-keys |
| `EMAIL_FROM` | **Verified sending address** on your Resend domain. Verified at https://resend.com/domains |
| `EMAIL_TO` | Inbox that **receives contact-form submissions** |

> `EMAIL_FROM` and `EMAIL_TO` are deliberately separate. `EMAIL_FROM` is the
> identity mail is sent *as* (Resend rejects any domain you have not verified);
> `EMAIL_TO` is where contact submissions are *delivered*.

Use a **bare address** for `EMAIL_FROM` — the display name is added
automatically (`"Zone De Rassemblement" <notifications@yourdomain.com>`).
A full `"Name <addr>"` value is also accepted; it is passed through untouched.

## Setup

Uses `resend` with a lazily-initialized client (see `src/lib/email.ts`):

```typescript
import { Resend } from "resend";
import { ENV } from "@/config/env";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!ENV.EMAIL.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY must be configured");
  }
  if (!resend) {
    resend = new Resend(ENV.EMAIL.RESEND_API_KEY);
  }
  return resend;
}

function getFrom(): string {
  if (!ENV.EMAIL.FROM || !ENV.APP_NAME) {
    throw new Error("EMAIL_FROM / APP_NAME must be configured");
  }
  // Already carries a display name — wrapping again would be malformed.
  if (ENV.EMAIL.FROM.includes("<")) return ENV.EMAIL.FROM;
  return `"${ENV.APP_NAME}" <${ENV.EMAIL.FROM}>`;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  const { error } = await getResend().emails.send({
    from: getFrom(),
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
```

`sendEmailWithTimeout` wraps `sendEmail` in a 30s `Promise.race` for emails
that gate user action.

Missing optional email vars are reported at boot by `src/config/env.ts`
(`⚠️ Optional environment variables not set: RESEND_API_KEY, EMAIL_FROM, EMAIL_TO`).

## Email Types

| Type | Trigger | Template | Strategy |
|------|---------|----------|----------|
| Email verification | Signup | `verify-email.html` | `sendEmailWithTimeout` (30s) |
| Password reset | Forgot password | `password-reset.html` | `sendEmailWithTimeout` (30s) |
| Event registration | Registration | `event-registration.html` | Fire-and-forget |
| Event cancellation | Cancellation | `event-cancellation.html` | Fire-and-forget |
| Event reminder | Cron job (hourly) | `event-reminder.html` | `await sendEmail` |
| Contact form | Contact page | Inline HTML, escaped | Fire-and-forget, `replyTo` = submitter |

All templates use a unified styled design: green header (`#1a5c2a`), card layout, CTA buttons, info callouts, and footer.

## Sending Strategies

| Email type | Pattern | Why |
|-----------|---------|-----|
| Signup verification | `await sendEmailWithTimeout` (30s) | Critical — user needs it to verify |
| Resend verification | `await sendEmailWithTimeout` (30s) | Critical — user explicitly requested it |
| Registration confirmation | Fire-and-forget `sendEmail` | Nice-to-have — user can check My Registrations |
| Cancellation | Fire-and-forget `sendEmail` | Nice-to-have |
| Forgot password | Fire-and-forget `sendEmail` | Token already created |
| Contact form | Fire-and-forget `sendEmail` | Message saved to `ContactMessage` first |
| Event reminders | `await sendEmail` | Cron job — needs sent/failed tracking |

**Key principle**: Critical emails that gate user action (signup, resend verification) must `await` with a timeout. Non-critical emails can fire-and-forget since the DB write already happened.

## Contact Form Delivery

`SendContactMessageService` (`src/services/contact/send-contact-message-service.ts`):

1. Persists the submission to `ContactMessage` — **this is the source of truth**.
2. Sends a notification to `EMAIL_TO` (falling back to `EMAIL_FROM`), with
   `replyTo` set to the submitter so replying reaches them directly.
3. Name/email/message are HTML-escaped before being embedded in the email.

Delivery is best-effort: the request still returns success if email fails, since
the message is already stored. Failures are logged server-side. If no recipient
is configured, one warning is logged and no email is attempted.

> There is no admin inbox UI — submissions are read from `ContactMessage` in the
> database or from the notification email.

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

