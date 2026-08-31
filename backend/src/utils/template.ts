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
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="background-color: #f4f4f4; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          ${content}
        </div>
      </div>
    </body>
    </html>
  `;
}

function header(title: string): string {
  return `
    <div style="background-color: #1a5c2a; padding: 30px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">Maison ZDR</h1>
      <p style="color: #c8e6d0; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">${title}</p>
    </div>
  `;
}

function footer(): string {
  return `
    <div style="background-color: #f4f4f4; padding: 20px 40px; text-align: center;">
      <p style="color: #999999; font-size: 12px; margin: 0;">
        This email was sent by Maison ZDR &middot; Zone de Rassemblement
      </p>
    </div>
  `;
}

function ctaButton(url: string, label: string): string {
  return `
    <p style="text-align: center; margin: 30px 0;">
      <a href="${url}"
         style="background-color: #1a5c2a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
        ${label}
      </a>
    </p>
  `;
}

const templates: Record<string, (data: TemplateData) => string> = {
  "verify-email.html": (data) => baseTemplate(`
    ${header("Email Verification")}

    <div style="padding: 35px 40px;">
      <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.name}</strong>,</p>
      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
        Thank you for registering with Maison ZDR. Please verify your email address by clicking the button below:
      </p>

      ${ctaButton(data.emailVerificationURL, "Verify Email")}

      <div style="background-color: #fff8e1; border-left: 4px solid #f9a825; padding: 14px 18px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
        <p style="color: #6d5a00; font-size: 14px; margin: 0; line-height: 1.5;">
          This link expires at ${data.expiresAt}. If you did not create an account, please ignore this email.
        </p>
      </div>

      <p style="color: #555555; font-size: 15px; margin: 0;">
        — The Maison ZDR Team
      </p>
    </div>

    ${footer()}
  `),

  "password-reset.html": (data) => baseTemplate(`
    ${header("Password Reset")}

    <div style="padding: 35px 40px;">
      <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.name}</strong>,</p>
      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
        We received a request to reset your password. Click the button below to choose a new one:
      </p>

      ${ctaButton(data.resetUrl, "Reset Password")}

      <div style="background-color: #fff8e1; border-left: 4px solid #f9a825; padding: 14px 18px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
        <p style="color: #6d5a00; font-size: 14px; margin: 0; line-height: 1.5;">
          This link expires at ${data.expiresAt}. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
        </p>
      </div>

      <p style="color: #555555; font-size: 15px; margin: 0;">
        — The Maison ZDR Team
      </p>
    </div>

    ${footer()}
  `),

  "event-registration.html": (data) => baseTemplate(`
    ${header("Registration Confirmed")}

    <div style="padding: 35px 40px;">
      <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong>,</p>
      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
        You have been successfully registered for the event below:
      </p>

      <div style="background-color: #f8faf8; border: 1px solid #d4e8da; border-radius: 6px; padding: 24px; margin-bottom: 25px;">
        <h2 style="color: #1a5c2a; font-size: 18px; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #e8f5ec;">${data.eventName}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; width: 120px; vertical-align: top;">Date</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Location</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.eventLocation}</td>
          </tr>
          ${data.hasPlusOne === "true" ? `
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Guest</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.guestName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Guests</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.guestCount}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="background-color: #f0f7f2; border-left: 4px solid #1a5c2a; padding: 14px 18px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
        <p style="color: #1a5c2a; font-size: 14px; margin: 0; line-height: 1.5;">
          Please arrive a few minutes early for a smooth check-in experience. You can view your registration details in your profile.
        </p>
      </div>

      <p style="color: #555555; font-size: 15px; margin: 0;">
        — The Maison ZDR Team
      </p>
    </div>

    ${footer()}
  `),

  "event-cancellation.html": (data) => baseTemplate(`
    ${header("Registration Cancelled")}

    <div style="padding: 35px 40px;">
      <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong>,</p>
      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
        Your registration for the following event has been cancelled:
      </p>

      <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 6px; padding: 24px; margin-bottom: 25px;">
        <h2 style="color: #555555; font-size: 18px; margin: 0; padding-bottom: 12px; border-bottom: 2px solid #eeeeee;">${data.eventName}</h2>
      </div>

      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px;">
        If this was a mistake, you can register again from the events page.
      </p>
      <p style="color: #555555; font-size: 15px; margin: 0;">
        — The Maison ZDR Team
      </p>
    </div>

    ${footer()}
  `),

  "event-reminder.html": (data) => baseTemplate(`
    ${header("Event Reminder")}

    <div style="padding: 35px 40px;">
      <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong>,</p>
      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
        This is a friendly reminder that your upcoming event is just around the corner!
      </p>

      <div style="background-color: #f8faf8; border: 1px solid #d4e8da; border-radius: 6px; padding: 24px; margin-bottom: 25px;">
        <h2 style="color: #1a5c2a; font-size: 18px; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #e8f5ec;">${data.eventTitle}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; width: 120px; vertical-align: top;">Date</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Time</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.eventTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Venue</td>
            <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.eventLocation}</td>
          </tr>
          ${data.referenceNumber ? `
          <tr>
            <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Reference</td>
            <td style="padding: 6px 0; color: #1a5c2a; font-size: 14px; font-weight: 700;">${data.referenceNumber}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="background-color: #fff8e1; border-left: 4px solid #f9a825; padding: 14px 18px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
        <p style="color: #6d5a00; font-size: 14px; margin: 0; line-height: 1.5;">
          ${data.referenceNumber
            ? "Don't forget to bring your reference number for check-in."
            : "Please arrive a few minutes early for a smooth check-in experience."}
        </p>
      </div>

      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px;">
        We look forward to seeing you there!
      </p>
      <p style="color: #555555; font-size: 15px; margin: 0;">
        — The Maison ZDR Team
      </p>
    </div>

    ${footer()}
  `),
};

export function renderTemplate(templateName: string, data: TemplateData): string {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }
  return template(data);
}
