import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import type { SignupInput } from "@/schema/auth";

export class AuthRepository {
  public findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  };

  public findUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  };

  public createUser = async (data: SignupInput & { role?: Role }) => {
    return prisma.user.create({ data });
  };

  public updateUser = async (id: string, data: { emailVerified?: Date }) => {
    return prisma.user.update({ where: { id }, data });
  };

  public updateUserProfile = async (id: string, data: { name?: string; email?: string; phone?: string; profilePic?: string }) => {
    return prisma.user.update({ where: { id }, data });
  };

  public createToken = async (data: {
    type: "REFRESH" | "EMAIL_VERIFY" | "PASSWORD_RESET";
    token: string;
    expiresAt: Date;
    userId: string;
  }) => {
    // Refresh JWTs are signed from {sub, role, type} + iat/exp (second
    // granularity), so two logins — or a login racing a concurrent refresh —
    // within the same second produce a byte-identical token string. A plain
    // create() then hits the `Token_token_key` unique constraint (P2002) and
    // surfaces as 500 "Unable to login account" / a failed refresh for
    // perfectly valid credentials. Upsert turns that duplicate into a
    // re-activation of the same session (fresh row for the same token value).
    return prisma.token.upsert({
      where: { token: data.token },
      update: {
        type: data.type,
        userId: data.userId,
        expiresAt: data.expiresAt,
        consumedAt: null,
        revokedAt: null,
      },
      create: data,
    });
  };

  public findToken = async (token: string, type: "REFRESH" | "EMAIL_VERIFY" | "PASSWORD_RESET") => {
    return prisma.token.findFirst({ where: { token, type } });
  };

  public findTokenByUser = async (userId: string, type: "REFRESH" | "EMAIL_VERIFY" | "PASSWORD_RESET") => {
    return prisma.token.findFirst({ where: { userId, type }, orderBy: { createdAt: "desc" } });
  };

  public consumeToken = async (id: string) => {
    return prisma.token.update({ where: { id }, data: { consumedAt: new Date() } });
  };

  /**
   * Atomically consume a refresh token: set consumedAt only if it is still NULL.
   * Returns the number of rows updated — 0 means the token was already consumed
   * or revoked (race-condition safe).
   */
  public consumeRefreshToken = async (token: string): Promise<number> => {
    const result = await prisma.token.updateMany({
      where: { token, type: "REFRESH", consumedAt: null, revokedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count;
  };

  public revokeToken = async (id: string) => {
    return prisma.token.update({ where: { id }, data: { revokedAt: new Date() } });
  };

  /**
   * Revoke every refresh token (session) belonging to a user.
   *
   * Scoped to `type: "REFRESH"` on purpose: logout must end *sessions*, not
   * unrelated flows. Revoking all token types used to kill outstanding
   * PASSWORD_RESET links ("Reset token has been revoked" after a logout) and
   * EMAIL_VERIFY tokens issued before the user signed out.
   */
  public revokeAllUserTokens = async (userId: string) => {
    return prisma.token.updateMany({
      where: { userId, type: "REFRESH" },
      data: { revokedAt: new Date() },
    });
  };

  public updateUserPassword = async (id: string, hashedPassword: string) => {
    return prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  };

  public findUserByGoogleId = async (googleId: string) => {
    return prisma.user.findFirst({ where: { googleId } });
  };

  public createUserWithGoogle = async (data: { email: string; name: string; googleId: string; profilePic?: string; emailVerified?: Date }) => {
    return prisma.user.create({ data });
  };

  public linkGoogleToUser = async (userId: string, googleId: string) => {
    // Google already verified the email, so mark it verified here too.
    // Otherwise a later refresh returns 403 "Email not verified".
    return prisma.user.update({ where: { id: userId }, data: { googleId, emailVerified: new Date() } });
  };

  // ==================== Admin helpers ====================

  /**
   * Find a user by id with selected fields for email/notification use.
   * Returns id, name, email — enough for sending emails.
   */
  public findUserForEmail = async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  };

  /**
   * Count active (non-suspended) admins, optionally excluding a specific user id.
   * Matching update-user-role-service.ts:27 logic.
   */
  public countActiveAdmins = async (excludeId?: string) => {
    return prisma.user.count({
      where: {
        role: "ADMIN",
        suspended: false,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  };

  /**
   * Set a user's suspended status.
   * Matching suspend-user-service.ts:19 logic.
   */
  public setSuspended = async (id: string, suspended: boolean) => {
    return prisma.user.update({
      where: { id },
      data: { suspended },
    });
  };

  /**
   * Delete all expired tokens (regardless of consumed/revoked status).
   * Called periodically by the scheduler to keep the tokens table lean.
   */
  public deleteExpiredTokens = async (): Promise<number> => {
    const result = await prisma.token.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  };
}
