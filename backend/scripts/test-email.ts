// Test script: sends a real email through Resend to verify delivery.
// How to run (from the backend/ directory):
//   npx tsx scripts/test-email.ts recipient@example.com
// Requires RESEND_API_KEY and EMAIL_FROM in backend/.env (both gitignored).
import { sendEmail } from "@/lib/email";

// Usage: npx tsx scripts/test-email.ts recipient@example.com
const to = process.argv[2];
if (!to) {
  console.error("Usage: npx tsx scripts/test-email.ts <recipient>");
  process.exit(1);
}

const result = await sendEmail({
  to,
  subject: "Maison ZDR — Resend test",
  html: "<p>Resend cutover test from Maison ZDR backend. If you received this, sending works.</p>",
}).then(
  () => ({ ok: true }),
  (err: unknown) => ({ ok: false, message: err instanceof Error ? err.message : String(err) })
);

console.log(JSON.stringify(result));
