import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export class AuthRepository {
  public findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  };

  public findUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  };

  public createUser = async (data: { name: string; email: string; password: string; role?: Role }) => {
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
}
