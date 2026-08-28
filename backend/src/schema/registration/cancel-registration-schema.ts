import { z } from "zod";

export const cancelRegistrationSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
  }),
});

export type CancelRegistrationInput = z.infer<typeof cancelRegistrationSchema>["body"];
