# Google OAuth — Login with Google

## Provider

**Google Cloud Console**: https://console.cloud.google.com

Uses Google Identity Services (ID Token flow) — no redirect needed, popup/one-tap sign-in.

## Environment Variables

```env
# Backend (.env)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_SECRET_ID=your-google-client-secret

# Frontend (.env)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Google Cloud Console Setup

1. Go to **APIs & Services > Credentials**
2. Create **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (local dev)
   - `https://your-domain.com` (production)
4. Add **Authorized redirect URIs** (required by Google but not used in ID Token flow):
   - `http://localhost:3000`
5. Copy Client ID and Client Secret

## How It Works

### ID Token Flow (no redirect)

```
1. Frontend loads Google Identity Services script
2. User clicks "Continue with Google"
3. Google shows account picker popup
4. User selects account
5. Google returns ID token to frontend callback
6. Frontend sends ID token to POST /api/auth/v1/google-login
7. Backend verifies token with Google's public keys
8. Backend finds/creates user, issues JWT cookies
9. User is logged in
```

## Backend Implementation

### Google Login Service (`src/services/auth/google-login-service.ts`)

```typescript
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

export async function GoogleLoginService(idToken: string) {
  // 1. Verify ID token with Google
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: ENV.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  // 2. Find or create user
  let user = await authRepo.findUserByGoogleId(googleId);

  if (!user) {
    // Check by email (link existing account)
    user = await authRepo.findUserByEmail(email);
    if (user) {
      await authRepo.linkGoogleToUser(user.id, googleId);
    } else {
      // Create new user (auto-verified, no password)
      user = await authRepo.createUserWithGoogle({
        email,
        name: name || email.split("@")[0],
        googleId,
        profilePic: picture,
        emailVerified: new Date(), // Auto-verify
      });
    }
  }

  // 3. Issue JWT tokens
  const accessToken = signAccessToken(user.id, user.role, "15m");
  const refreshToken = signRefreshToken(user.id, user.role, "7d");

  return { tokens: { accessToken, refreshToken }, user: { ... } };
}
```

### Database Changes

Added to User model:
```prisma
googleId String?   // Google's unique user ID
password String?   // Now optional (Google users don't need a password)
```

### Route

```typescript
router.post("/v1/google-login", authController.googleLogin);
```

## Frontend Implementation

### Google Identity Services (`LoginForm.tsx`)

```typescript
// Load Google script
const script = document.createElement("script");
script.src = "https://accounts.google.com/gsi/client";

// Initialize
window.google.accounts.id.initialize({
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  callback: handleGoogleCredentialResponse,
});

// Render button
window.google.accounts.id.renderButton(googleButtonRef.current, {
  type: "standard",
  size: "large",
  text: "continue_with",
});
```

### Auth Service

```typescript
googleLogin: async (idToken: string) => {
  const response = await axiosInstance.post("/api/auth/v1/google-login", { idToken });
  return response.data;
},
```

## User Account Linking

| Scenario | Behavior |
|----------|----------|
| New Google user | Creates new account with `googleId`, `emailVerified`, no password |
| Existing email matches | Links Google account to existing user, sets `profilePic` if missing |
| Existing `googleId` matches | Logs in normally |

## Package

```bash
npm install google-auth-library
```

Used for `OAuth2Client.verifyIdToken()` — verifies the ID token against Google's public keys.
