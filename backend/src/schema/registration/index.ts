import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
    hasPlusOne: z.boolean().optional(),
    guestName: z.string().min(1, "Guest name is required").optional(),
  }),
});

export const cancelRegistrationSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
  }),
});
