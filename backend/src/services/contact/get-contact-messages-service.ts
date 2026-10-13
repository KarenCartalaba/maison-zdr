import { ContactRepository } from "@/repositories/contact.repository";

const contactRepo = new ContactRepository();

export async function GetContactMessagesService(filters?: { search?: string }) {
  try {
    const messages = await contactRepo.listMessages(filters);
    return {
      code: 200,
      status: "success",
      message: "Contact messages retrieved successfully",
      data: { messages },
    };
  } catch (error) {
    console.error("GetContactMessagesService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve contact messages" };
  }
}
