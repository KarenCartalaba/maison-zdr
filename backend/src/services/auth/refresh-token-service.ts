import * as authRepo from "@/repositories/auth.repository";
import { signAccessToken, signRefreshToken, TokenExpiry, verifyRefreshToken } from "@/lib/jwt";

export async function RefreshTokenService(refreshToken?: string) {
  const payload = verifyRefreshToken(refreshToken!);

  if (!payload) {
    return { code: 401, status: "error", message: "Invalid or expired refresh token" };
  }

  const dbToken = await authRepo.findToken(refreshToken!, "REFRESH");
  if (!dbToken || dbToken.consumedAt || dbToken.revokedAt) {
    return { code: 401, status: "error", message: "Token is no longer valid or has been used" };
  }

  const user = await authRepo.findUserById(payload.sub);
  if (!user) {
    return { code: 404, status: "error", message: "User not found" };
  }

  if (!user.emailVerified) {
    return { code: 403, status: "error", message: "Email not verified" };
  }

  await authRepo.consumeToken(dbToken.id);

  const accessToken = signAccessToken(user.id, user.role, TokenExpiry.ACCESS_TOKEN_EXPIRES);
  const newRefreshToken = signRefreshToken(user.id, user.role, TokenExpiry.REFRESH_TOKEN_EXPIRES);

  await authRepo.createToken({
    type: "REFRESH",
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId: user.id,
  });

  return {
    code: 200,
    status: "success",
    message: "Session refreshed",
    data: {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
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
}
