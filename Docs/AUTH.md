# Authentication — JWT with httpOnly Cookies

## Overview

Cookie-based JWT authentication with access + refresh token pattern. No `Authorization` header — tokens transported via httpOnly cookies.

## Token Structure

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access token | 15 minutes | API requests |
| Refresh token | 7 days | Get new access token |

### JWT Payload

```typescript
{
  sub: string;    // User ID
  role: string;   // USER | ADMIN | MODERATOR
  type: "access" | "refresh";
}
```

## Environment Variable

```env
JWT_SECRET=your-secret-here  # Generate at https://jwtsecrets.com/
```

## Flow

### Login

```
1. User submits email + password
2. Backend verifies credentials
3. Backend signs access token (15m) + refresh token (7d)
4. Backend stores refresh token in Token table
5. Backend sets httpOnly cookies:
   - accessToken: 15 min expiry
   - refreshToken: 7 day expiry
6. Returns user object (id, email, name, role, profilePic)
```

### Authenticated Request

```
1. Frontend sends request with credentials: "include"
2. Axios interceptor attaches cookies automatically
3. Auth middleware extracts token from cookie (or Authorization header)
4. Verifies token signature + checks type === "access"
5. Attaches { sub, role, type } to req.user
```

### Token Refresh

```
1. Access token expires (401 response)
2. Frontend interceptor catches 401
3. Sends POST /api/auth/v1/refresh-token with refresh token cookie
4. Backend verifies refresh token (checks type === "refresh")
5. Issues new access token + refresh token
6. Updates refresh token in database
7. Retries original request
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/jwt.ts` | Sign/verify tokens |
| `src/middlewares/auth-middleware.ts` | Extract + verify tokens |
| `src/middlewares/rbac.ts` | Role-based access control |
| `src/services/auth/login-credentials-service.ts` | Email/password login |
| `src/services/auth/google-login-service.ts` | Google OAuth login |
| `src/services/auth/refresh-token-service.ts` | Token refresh |
| `frontend/services/axios.ts` | Auto-refresh interceptor |
| `frontend/context/AuthContext.tsx` | React auth state |

## Cookie Settings

```typescript
res.cookie("accessToken", token, {
  httpOnly: true,       // Not accessible via JavaScript
  secure: isProduction, // HTTPS only in production
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

## Role-Based Access Control

### Roles (hierarchy)

```
ADMIN > MODERATOR > USER
```

### Middleware Chain

```typescript
router.get("/v1/me", authMiddleware.execute, authController.me);
router.get("/admin/users", authMiddleware.execute, permittedRole(["ADMIN"]), adminController.getUsers);
```

### Frontend Role Checks

```typescript
const { isAdmin, isModerator, isVerified } = useAuth();

// Route guards in layout.tsx
if (!isAuthenticated) redirect("/login");
if (!isAdmin) redirect("/");
```

## Password Hashing

Uses Node.js `crypto.scryptSync` with random salt:

```typescript
// Format: salt:hash
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
return `${salt}:${hash}`;
```

## Email Verification

1. Signup creates `EMAIL_VERIFY` token (24h expiry)
2. Verification link sent via email
3. User clicks link → GET /api/auth/v1/verify-email?token=xxx
4. Backend sets `emailVerified` timestamp on user
5. Login blocked until email verified (403 response)
6. Google OAuth users auto-verified (no email check)

## Password Reset Flow

1. User requests reset at `POST /api/auth/v1/forgot-password` with email
2. Backend generates random token, stores as `PASSWORD_RESET` (1h expiry)
3. Password reset email sent (fire-and-forget with SMTP timeout)
4. User clicks link → `/reset-password?token=xxx` frontend page
5. User enters new password + confirmation
6. Frontend submits to `POST /api/auth/v1/reset-password` with token + password
7. Backend validates token (exists, not consumed, not revoked, not expired)
8. Backend hashes new password, updates user, consumes token
9. User redirected to login

### Key Files

| File | Purpose |
|------|---------|
| `src/services/auth/forgot-password-service.ts` | Generate token + send email |
| `src/services/auth/reset-password-service.ts` | Verify token + update password |
| `src/schema/auth/reset-password-schema.ts` | Validate token + password |
| `frontend/app/(auth)/reset-password/page.tsx` | Reset password page |
| `frontend/components/features/auth/ResetPasswordForm.tsx` | Password reset form |
