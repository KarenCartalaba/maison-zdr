import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
    hasPlusOne: z.boolean().optional(),
    guestName: z.string().min(1, "Guest name is required").optional(),
    guestNames: z.array(z.string().min(1)).optional(),
    guestCount: z.number().int().min(0).optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
