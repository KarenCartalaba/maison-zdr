import { prisma } from "@/lib/prisma";
import bcrypt from "jsonwebtoken";
import { Role } from "@/generated/prisma/enums";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (data: { name: string; email: string; password: string; role?: Role }) => {
  return prisma.user.create({ data });
};

export const updateUser = async (id: string, data: { emailVerified?: Date }) => {
  return prisma.user.update({ where: { id }, data });
};

export const createToken = async (data: {
  type: "REFRESH" | "EMAIL_VERIFY" | "PASSWORD_RESET";
  token: string;
  expiresAt: Date;
  userId: string;
}) => {
  return prisma.token.create({ data });
};

export const findToken = async (token: string, type: "REFRESH" | "EMAIL_VERIFY" | "PASSWORD_RESET") => {
  return prisma.token.findFirst({ where: { token, type } });
};

export const consumeToken = async (id: string) => {
  return prisma.token.update({ where: { id }, data: { consumedAt: new Date() } });
};

export const revokeToken = async (id: string) => {
  return prisma.token.update({ where: { id }, data: { revokedAt: new Date() } });
};

export const revokeAllUserTokens = async (userId: string) => {
  return prisma.token.updateMany({ where: { userId }, data: { revokedAt: new Date() } });
};
