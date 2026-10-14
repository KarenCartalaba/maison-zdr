import { z } from "zod";
import { emailSchema } from "@/lib/email-validation";

export const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>["body"];
