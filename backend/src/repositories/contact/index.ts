import { prisma } from "@/lib/prisma";

export class ContactRepository {
  public createMessage = async (data: { name: string; email: string; message: string }) => {
    // Store contact messages — using a simple approach since there's no Contact model
    // In production, you'd have a ContactMessage model
    console.log("Contact form submission:", data);
    return { id: "contact-" + Date.now(), ...data, createdAt: new Date() };
  };
}
