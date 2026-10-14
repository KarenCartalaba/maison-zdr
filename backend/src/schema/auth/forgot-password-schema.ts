import { z } from "zod";
import { emailSchema } from "@/lib/email-validation";

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
