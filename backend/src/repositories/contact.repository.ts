import { prisma } from "@/lib/prisma";
import type { ContactInput } from "@/schema/contact";

export class ContactRepository {
  public createMessage = async (data: ContactInput) => {
    return prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });
  };

  public listMessages = async (filters?: { search?: string }) => {
    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { message: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    return prisma.contactMessage.findMany({
      where,
      select: { id: true, name: true, email: true, message: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  };
}
