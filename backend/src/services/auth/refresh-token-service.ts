import { AuthRepository } from "@/repositories/auth.repository";
import { signAccessToken, signRefreshToken, TokenExpiry, verifyRefreshToken } from "@/lib/jwt";

const authRepo = new AuthRepository();

// Grace window for concurrent refreshes (e.g. two tabs refreshing at once).
// Uses the Token.consumedAt column, so no migration or in-memory state needed.
const REFRESH_REUSE_GRACE_MS = 10_000;

export async function RefreshTokenService(refreshToken?: string) {
  const payload = verifyRefreshToken(refreshToken!);

  if (!payload) {
    return { code: 401, status: "error", message: "Invalid or expired refresh token" };
  }

  // Atomic consume: only one concurrent request wins the race.
  const consumedCount = await authRepo.consumeRefreshToken(refreshToken!);
  if (consumedCount === 0) {
    // Token already consumed/revoked — allow reuse only if THIS exact token
    // was consumed within the grace window (concurrent-tab race). Otherwise
    // it is a genuinely old/replayed token.
    const existing = await authRepo.findToken(refreshToken!, "REFRESH");
    const consumedAtMs = existing?.consumedAt?.getTime();
    const isRecentReuse =
      !!existing &&
      existing.userId === payload.sub &&
      existing.revokedAt == null &&
      existing.expiresAt.getTime() > Date.now() &&
      consumedAtMs != null &&
      Date.now() - consumedAtMs <= REFRESH_REUSE_GRACE_MS;
    if (!isRecentReuse) {
      return { code: 401, status: "error", message: "Invalid refresh token" };
    }
  }

  const user = await authRepo.findUserById(payload.sub);
  if (!user) {
    return { code: 404, status: "error", message: "User not found" };
  }

  if (!user.emailVerified) {
    return { code: 403, status: "error", message: "Email not verified" };
  }

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
