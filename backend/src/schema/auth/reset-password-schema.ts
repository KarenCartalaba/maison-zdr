import { z } from "zod";

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
