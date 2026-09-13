import { ContactRepository } from "@/repositories/contact.repository";
import { sendEmail } from "@/lib/nodemailer";
import { ENV } from "@/config/env";

const contactRepo = new ContactRepository();

export async function SendContactMessageService(name: string, email: string, message: string) {
  try {
    await contactRepo.createMessage({ name, email, message });

    // Send notification email to admin (don't block on failure)
    sendEmail({
      to: ENV.SMTP.FROM || "",
      subject: `Contact Form: ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    }).catch(console.error);

    return { code: 200, status: "success", message: "Message sent successfully. We'll get back to you soon!" };
  } catch (error) {
    console.error("SendContactMessageService error", error);
    return { code: 500, status: "error", message: "Unable to send message" };
  }
}
