import { ContactRepository } from "@/repositories/contact.repository";
import { sendEmail } from "@/lib/email";
import { ENV } from "@/config/env";

const contactRepo = new ContactRepository();

/** Contact details are user input rendered into an HTML email — escape them. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function SendContactMessageService(name: string, email: string, message: string) {
  try {
    // The DB write is the source of truth; email delivery is best-effort on top.
    await contactRepo.createMessage({ name, email, message });
  } catch (error) {
    console.error("SendContactMessageService error", error);
    return { code: 500, status: "error", message: "Unable to send message" };
  }

  // EMAIL_FROM is the verified sending address, not an inbox — submissions are
  // delivered to EMAIL_TO. Falling back to EMAIL_FROM keeps older deployments
  // working before EMAIL_TO is configured.
  const recipient = ENV.EMAIL.TO || ENV.EMAIL.FROM;

  if (!recipient) {
    console.warn(
      "Contact message saved but no email sent: set EMAIL_TO (recipient) and EMAIL_FROM (sender) to enable delivery.",
    );
    return { code: 200, status: "success", message: "Message sent successfully. We'll get back to you soon!" };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  sendEmail({
    to: recipient,
    replyTo: email,
    subject: `Contact Form: ${name}`,
    html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
  }).catch((error) => {
    console.error("Contact notification email failed", error);
  });

  return { code: 200, status: "success", message: "Message sent successfully. We'll get back to you soon!" };
}
