import { z } from "zod";
import { emailSchema } from "@/lib/email-validation";

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
