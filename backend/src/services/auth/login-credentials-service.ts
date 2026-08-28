import * as authRepo from "@/repositories/auth.repository";
import { verifyPassword } from "@/utils/password";
import { signAccessToken, signRefreshToken, TokenExpiry } from "@/lib/jwt";

export async function LoginCredentialsService(email: string, password: string) {
  try {
    const user = await authRepo.findUserByEmail(email);
    if (!user || !user.password || !verifyPassword(password, user.password)) {
      return { code: 400, status: "error", message: "Invalid credentials" };
    }

    if (!user.emailVerified) {
      return { code: 403, status: "error", message: "Please verify your email first" };
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
      message: "Login successful",
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
        },
      },
    };
  } catch (error) {
    console.error("LoginCredentialsService Error", error);
    return { code: 500, status: "error", message: "Unable to login account" };
  }
}
