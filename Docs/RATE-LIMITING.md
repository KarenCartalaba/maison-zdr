# Rate Limiting — express-rate-limit

## Package

**express-rate-limit**: https://www.npmjs.com/package/express-rate-limit

Middleware to limit repeated requests to public APIs and/or endpoints.

## Installation

```bash
npm install express-rate-limit
```

## Configuration (`src/lib/rate-limit.ts`)

Four tiers with different thresholds:

| Tier | Window | Limit | Use For |
|------|--------|-------|---------|
| **Strict** | 15 min | 5 requests | Contact form |
| **Moderate** | 15 min | 10 requests | (defined, currently unused) |
| **Auth** | 15 min | 30 requests | Signup, login, forgot-password, resend-verification, reset-password |
| **Global** | 1 min | 100 requests | All `/api` routes |

```typescript
import { rateLimit } from "express-rate-limit";

// Strict: 5 requests per 15 minutes
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many attempts. Please try again later." },
});

// Moderate: 10 requests per 15 minutes
export const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many requests. Please try again later." },
});

// Auth: 30 requests per 15 minutes — anonymous auth endpoints.
// Lenient enough for shared networks, tight enough to blunt credential
// stuffing and email-enumeration probing (login returns specific errors).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many attempts. Please try again later." },
});

// Global: 100 requests per minute
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many requests. Please slow down." },
});
```

## Where Applied

### Global (`src/app.ts`)

Applied to all `/api` routes:

```typescript
app.use('/api', globalLimiter, routes);
```

### Auth Routes (`src/routes/auth.routes.ts`)

| Route | Limiter | Why |
|-------|---------|-----|
| `POST /v1/signup` | auth | Prevent mass account creation |
| `POST /v1/login` | auth | Prevent brute force + enumeration probing |
| `POST /v1/forgot-password` | auth | Prevent email bombing |
| `POST /v1/resend-email-verification` | auth | Prevent email spam |
| `POST /v1/reset-password` | auth | Prevent token guessing |

Not limited (deliberately): `google-login` (requires a valid Google ID token — can't be abused anonymously), `refresh-token` (interceptor-driven; limiting it would break sessions), `verify-email` link (single-use tokens), and all authenticated-only routes.

### Contact Routes (`src/routes/contact.routes.ts`)

| Route | Limiter | Why |
|-------|---------|-----|
| `POST /v1/send` | strict | Prevent contact form spam |

## Key Options Used

| Option | Value | Purpose |
|--------|-------|---------|
| `windowMs` | 15 min / 1 min | Time window for counting requests |
| `limit` | 5 / 10 / 30 / 100 | Max requests per window |
| `standardHeaders` | `"draft-7"` | Return rate limit info in `Ratelimit` headers |
| `legacyHeaders` | `false` | Disable old `X-Rate-Limit` headers |
| `message` | JSON object | Custom error response format |

## How It Works

1. Middleware tracks requests by client IP (`req.ip`)
2. Counts requests within the time window
3. Returns `429 Too Many Requests` when limit exceeded
4. Response includes `Ratelimit-Limit`, `Ratelimit-Remaining`, `Ratelimit-Reset` headers
5. After window expires, counter resets

## Response Format

When rate limited, returns:

```json
{
  "code": 429,
  "status": "error",
  "message": "Too many attempts. Please try again later."
}
```

## Frontend Handling

The frontend Axios interceptor catches 429 errors and displays the error message via toast:

```typescript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      toast.error(error.response.data.message || "Too many requests");
    }
    return Promise.reject(error);
  }
);
```

## Trust Proxy (Required for Render)

`trust proxy` is configured in `src/app.ts` so `express-rate-limit` correctly reads the real client IP behind Render's reverse proxy:

```typescript
app.set("trust proxy", 1); // Trust first proxy
```

Without this, Render sets `X-Forwarded-For` headers and Express throws `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`.

For multi-instance deployments, use a shared store (Redis) instead of in-memory:

```typescript
import RedisStore from "rate-limit-redis";
import { redis } from "@/lib/redis";

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  // ... other options
});
```
