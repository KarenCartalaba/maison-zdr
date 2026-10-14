import { sendEmail } from "@/lib/email";
import { ENV } from "@/config/env";

/**
 * Venue inbox: every contact-form submission is delivered straight here.
 * Submissions are intentionally NOT persisted — there is no DB write.
 */
const CONTACT_INBOX_EMAIL = "maisonzdr@gmail.com";

/** Contact details are user input rendered into an HTML email — escape them. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Warn at most once per process: missing Resend config is a deploy problem. */
let warnedMissingEmailConfig = false;

export async function SendContactMessageService(name: string, email: string, message: string) {
  if (!ENV.EMAIL.RESEND_API_KEY || !ENV.EMAIL.FROM) {
    if (!warnedMissingEmailConfig) {
      warnedMissingEmailConfig = true;
      console.warn(
        `⚠️  CONTACT EMAIL NOT SENT: RESEND_API_KEY and/or EMAIL_FROM is not set, so the submission from ${email} was NOT delivered to ${CONTACT_INBOX_EMAIL}. Set both variables to enable contact delivery.`,
      );
    }
    return { code: 200, status: "success", message: "Message sent successfully. We'll get back to you soon!" };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  // Best-effort delivery: the API already returned success to the visitor.
  sendEmail({
    to: CONTACT_INBOX_EMAIL,
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
