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
    return prisma.token.create({ data });
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

  public revokeToken = async (id: string) => {
    return prisma.token.update({ where: { id }, data: { revokedAt: new Date() } });
  };

  public revokeAllUserTokens = async (userId: string) => {
    return prisma.token.updateMany({ where: { userId }, data: { revokedAt: new Date() } });
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
    return prisma.user.update({ where: { id: userId }, data: { googleId } });
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
}
