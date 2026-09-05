# Session Notes — Maison ZDR

**Date**: September 5, 2026
**Session focus**: SMTP email debugging, Resend migration (reverted), Render deployment investigation

---

## What Happened This Session

### 1. SMTP Email Not Working on Render
- User reported emails not being received on deployed Render instance
- Local email worked fine
- Investigation revealed **Render free tier blocks outbound SMTP ports (25, 465, 587)** since September 26, 2025
- This is a platform restriction, not a code bug

### 2. IPv6 / ENETUNREACH Investigation (Earlier sessions, carried into this one)
- Nodemailer was resolving `smtp.gmail.com` to an IPv6 address `2404:6800:4003:c04::6d`
- Render doesn't support IPv6 → `ENETUNREACH` error
- Added `getSocket` with `dns.resolve4()` to force IPv4 → worked for DNS but TCP still timed out
- **Root cause was NOT IPv6** — it was Render blocking SMTP ports entirely
- `family: 4` option does NOT work in nodemailer (never forwarded to DNS resolver or `net.connect()`)

### 3. Resend Migration (Then Reverted)
- Migrated from nodemailer to Resend (HTTPS email API) to bypass SMTP port blocking
- Created `src/lib/email.ts` with Resend SDK
- Updated 6 service files, env config, docs
- **User decided to revert to nodemailer** — concluded the issue is Render free tier, not code
- Reverted everything back to nodemailer using user's cleaner template pattern

### 4. Admin Users Cache Fixed
- User confirmed admin users cache invalidation is now working (new users appear immediately in admin panel)
- This was fixed earlier via `cacheInvalidatePattern("admin:users:*")` in signup service

---

## Current State of Email System

### `src/lib/nodemailer.ts` (final version)
- Lazy transporter initialization (created on first use, not at module load)
- Validates env vars before creating transporter
- Uses `ENV` config from `@/config/env`
- `sendEmail()` — sends email, formats from as `"APP_NAME <SMTP_FROM>"`
- `sendEmailWithTimeout()` — wraps sendEmail with Promise.race timeout (30s default)
- **No `getSocket` / `dns.resolve4` / IPv4 forcing** — clean template from user

### Email Sending Strategies
| Email Type | Pattern | Why |
|-----------|---------|-----|
| Signup verification | `await sendEmailWithTimeout` (30s) | Critical — gates user action |
| Resend verification | `await sendEmailWithTimeout` (30s) | Critical — user explicitly requested |
| Registration confirmation | Fire-and-forget `sendEmail` | Nice-to-have |
| Cancellation | Fire-and-forget `sendEmail` | Nice-to-have |
| Forgot password | Fire-and-forget `sendEmail` | Token already created |
| Contact form | Fire-and-forget `sendEmail` | Message saved to DB |
| Event reminders | `await sendEmail` | Cron job — needs tracking |

### Email Templates (5 total, all in `src/utils/template.ts`)
All use unified styled design: green header (`#1a5c2a`), card layout, CTA buttons, footer.
- `verify-email.html`
- `password-reset.html`
- `event-registration.html`
- `event-cancellation.html`
- `event-reminder.html`

---

## Render Free Tier SMTP Limitation

**This is the real blocker for email on Render.**

- Since September 26, 2025, Render blocks outbound traffic to SMTP ports 25, 465, 587 on free tier
- The code is correct — it's the platform restriction
- SMTP works locally and on paid Render instances
- Alternative for free tier: HTTPS email API (Resend, SendGrid, Mailgun)

### Render Env Vars Needed
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=maisonzdr@gmail.com
SMTP_PASSWORD=ddxx fiqy vgak saip
SMTP_FROM=maisonzdr@gmail.com
```

---

## Architecture Summary

### Backend (`/backend`)
- **Runtime**: Node.js + Express 5
- **Build**: tsdown (outputs `dist/server.mjs`)
- **Database**: PostgreSQL (Neon) via Prisma 7.10.0
- **Cache**: Redis (Upstash) via ioredis
- **Auth**: JWT (access + refresh tokens in httpOnly cookies)
- **Email**: Nodemailer (Gmail SMTP)
- **Uploads**: Cloudinary
- **Rate limiting**: express-rate-limit with 3 tiers
- **Scheduler**: node-cron for event reminders (hourly)
- **Trust proxy**: enabled (`app.set('trust proxy', 1)`)

### Frontend (`/frontend`)
- **Framework**: Next.js 16 + React 19
- **UI**: Shadcn (base-ui based, NOT radix)
- **State**: React Context (AuthContext)
- **Data fetching**: TanStack Table v9, Axios
- **Styling**: Tailwind 4
- **PWA**: Installable (no push notifications)
- **Primary color**: Dark green `#1a5c2a`

### Route Groups
- `(visitor)` — Public pages (home, events, gallery, news, contact)
- `(auth)` — Login, signup, forgot/reset password, verify email
- `(authenticated)` — Profile, my registrations
- `(verified)` — Event registration form
- `admin` — Admin dashboard (events, users, news, gallery, reviews, contact, profile)

---

## Key Gotchas / Things to Remember

### Shadcn (base-ui) DropdownMenu
- **NEVER use `render={<Button>}`** on `DropdownMenuTrigger` — causes ref forwarding crash
- Use plain styled `<button>` directly on the trigger
- **Wrap `DropdownMenuLabel` and `DropdownMenuSeparator` in `<DropdownMenuGroup>`** — base-ui requires parent `Menu.Group`

### Prisma
- Generated client at `src/generated/prisma/` — imported via relative path
- After migrations: `npm run db:generate` (runs `prisma generate && node scripts/patch-prisma.mjs`)
- `patch-prisma.mjs` rewrites `.mjs` → `.js` in generated client (ESM fix)

### TanStack Table v9
- API: `useTable` + `tableFeatures({})` — NOT v8 API

### Frontend Data Fetching
- `serverFetchCached<T>()` — for public ISR pages
- `serverFetch<T>()` — for no-cache (events, news pages)
- `serverFetchAuth<T>()` — for authenticated requests

### Auth
- 4 roles: Visitor, Unverified User, Verified User, Admin, Moderator
- `AuthContext.updateUser(patch)` — directly patches user state + localStorage (bypasses Redis cache)
- Google OAuth: ID Token flow (popup/one-tap, not redirect)

### Image Handling
- `EventImage` component — shows image or green gradient fallback with first letter
- `cacheKey` prop for cache-busting on image updates
- Profile pic: `user?.profilePic || "/images/profile-placeholder.jpg"`

### Build
- Always run `npm run build` after changes to verify
- Backend: `tsdown` with `deps.neverBundle` for native packages
- Frontend: `next build`

---

## Git History (Recent)

```
a08843b feat(email): switch from Resend API to Nodemailer for email delivery
be670b8 feat(email): migrate from Nodemailer to Resend API for email delivery
7f3ba72 fix
dae7753 Merge pull request #16 from KarenCartalaba/development
c9b39e7 feat(email): enforce IPv4 for SMTP connections on Render free tier to prevent ENETUNREACH errors
718812b Merge pull request #15 from KarenCartalaba/development
f94a6bf feat(email): update email sending to use sendEmailWithTimeout for critical emails
1fc5ead Merge pull request #14 from KarenCartalaba/development
57df4cd feat(email): update email sending strategy to fire-and-forget for non-critical emails
1d04e05 feat(auth): add validate reset token functionality and integrate with frontend
2b23cf0 feat(auth): implement password reset functionality with email notifications
4bfb9df Merge pull request #13 from KarenCartalaba/development
7755fff feat(email): implement SMTP timeout handling for email sending
2f877b6 Merge pull request #12 from KarenCartalaba/development
da2b56d feat: improve error handling for email sending in verification and registration services
9b3e80d Merge pull request #11 from KarenCartalaba/development
f0fe943 feat: configure trust proxy for express-rate-limit to read real client IP behind Render's reverse proxy
d1491b9 Merge pull request #10 from KarenCartalaba/development
aa904d3 feat: enhance user profile handling with improved image upload and update functionality
e907518 feat(rate-limiting): implement express-rate-limit middleware for API endpoints
```

---

## Pending / Next Steps

1. **Email delivery on Render** — SMTP blocked on free tier. Options:
   - Upgrade to Render paid instance ($7/mo)
   - Switch to HTTPS email API (Resend/SendGrid) — code change needed
   - Deploy on a different platform (VPS, Vercel, Railway paid)
2. **Resend API key** (if switching back to Resend): stored in password manager — add as `RESEND_API_KEY` env var, never commit it
3. **Production domain verification** in Resend dashboard (if using Resend)
4. **Google Cloud Console** — update redirect URIs for production domain
5. **Session notes for transfer** — this document

---

## File Reference

### Key Backend Files
- `src/lib/nodemailer.ts` — Email transport (Nodemailer)
- `src/lib/redis.ts` — Redis cache helpers
- `src/lib/prisma.ts` — Prisma client
- `src/lib/cloudinary.ts` — Cloudinary upload
- `src/lib/jwt.ts` — JWT helpers
- `src/lib/rate-limit.ts` — Rate limiting tiers
- `src/config/env.ts` — Environment variable config
- `src/app.ts` — Express app setup
- `src/server.ts` — Server entry point
- `src/scheduler.ts` — Event reminder cron
- `src/utils/template.ts` — All 5 email templates
- `prisma/schema.prisma` — Database schema

### Key Frontend Files
- `context/AuthContext.tsx` — Auth state + `updateUser(patch)` method
- `components/ui/event-image.tsx` — Reusable image with fallback
- `lib/api.ts` — Server-side fetch helpers
- `constants/index.ts` — Routes and API endpoints

### Documentation
- `docs/EMAIL.md` — Email setup and strategies
- `docs/DEPLOYMENT.md` — Render deployment guide
- `docs/AUTH.md` — Authentication flows
- `docs/DATABASE.md` — Prisma schema docs
- `docs/CLOUDINARY.md` — Image upload docs
- `docs/REDIS.md` — Caching docs
- `docs/RATE-LIMITING.md` — Rate limiting docs
- `docs/GOOGLE-AUTH.md` — Google OAuth docs
