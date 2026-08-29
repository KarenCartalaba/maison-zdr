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
}
