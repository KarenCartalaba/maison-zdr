import { OAuth2Client } from "google-auth-library";
import { AuthRepository } from "@/repositories/auth.repository";
import { signAccessToken, signRefreshToken, TokenExpiry } from "@/lib/jwt";
import { ENV } from "@/config/env";

const authRepo = new AuthRepository();
const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

export async function GoogleLoginService(idToken: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return { code: 400, status: "error", message: "Invalid Google token" };
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists by Google ID
    let user = await authRepo.findUserByGoogleId(googleId);

    // If not, check by email (link existing account)
    if (!user) {
      user = await authRepo.findUserByEmail(email);
      if (user) {
        // Link Google account to existing user
        await authRepo.linkGoogleToUser(user.id, googleId);
        if (picture && !user.profilePic) {
          await authRepo.updateUserProfile(user.id, { profilePic: picture });
        }
      } else {
        // Create new user
        user = await authRepo.createUserWithGoogle({
          email,
          name: name || email.split("@")[0],
          googleId,
          profilePic: picture || undefined,
          emailVerified: new Date(),
        });
      }
    }

    if (!user) {
      return { code: 500, status: "error", message: "Failed to create user" };
    }

    if (user.suspended) {
      return { code: 403, status: "error", message: "Account has been suspended" };
    }

    const accessToken = signAccessToken(user.id, user.role, TokenExpiry.ACCESS_TOKEN_EXPIRES);
    const refreshToken = signRefreshToken(user.id, user.role, TokenExpiry.REFRESH_TOKEN_EXPIRES);

    await authRepo.createToken({
      type: "REFRESH",
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: user.id,
    });

    return {
      code: 200,
      status: "success",
      message: "Google login successful",
      data: {
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: TokenExpiry.ACCESS_TOKEN_EXPIRES,
          refreshExpiresIn: TokenExpiry.REFRESH_TOKEN_EXPIRES,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePic: user.profilePic,
        },
      },
    };
  } catch (error) {
    console.error("GoogleLoginService Error", error);
    return { code: 401, status: "error", message: "Invalid Google token" };
  }
}
