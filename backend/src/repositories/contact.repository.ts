import { prisma } from "@/lib/prisma";
import type { ContactInput } from "@/schema/contact";

export class ContactRepository {
  public createMessage = async (data: ContactInput) => {
    // Store contact messages — using a simple approach since there's no Contact model
    // In production, you'd have a ContactMessage model
    console.log("Contact form submission:", data);
    return { id: "contact-" + Date.now(), ...data, createdAt: new Date() };
  };
}
