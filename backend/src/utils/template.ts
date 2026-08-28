interface TemplateData {
  [key: string]: string;
}

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${content}
    </body>
    </html>
  `;
}

const templates: Record<string, (data: TemplateData) => string> = {
  "verify-email.html": (data) => baseTemplate(`
    <h2>Welcome, ${data.name}!</h2>
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.emailVerificationURL}"
         style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
    </p>
    <p>This link expires at: ${data.expiresAt}</p>
    <p>If you did not create an account, please ignore this email.</p>
  `),
  "event-registration.html": (data) => baseTemplate(`
    <h2>Registration Confirmed!</h2>
    <p>Hi ${data.userName},</p>
    <p>You have been successfully registered for <strong>${data.eventName}</strong>.</p>
    <p><strong>Date:</strong> ${data.eventDate}</p>
    <p><strong>Location:</strong> ${data.eventLocation}</p>
    ${data.hasPlusOne === "true" ? `<p>Plus-one guest: ${data.guestName}</p>` : ""}
  `),
  "event-cancellation.html": (data) => baseTemplate(`
    <h2>Registration Cancelled</h2>
    <p>Hi ${data.userName},</p>
    <p>Your registration for <strong>${data.eventName}</strong> has been cancelled.</p>
  `),
};

export function renderTemplate(templateName: string, data: TemplateData): string {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }
  return template(data);
}
