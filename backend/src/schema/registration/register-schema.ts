import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
    hasPlusOne: z.boolean().optional(),
    guestName: z.string().min(1, "Guest name is required").max(100, "Guest name must be at most 100 characters").optional(),
    guestNames: z.array(z.string().min(1, "Guest name cannot be empty").max(100, "Guest name must be at most 100 characters")).max(10, "Cannot exceed 10 guest names").optional(),
    guestCount: z.number().int().min(0).max(10, "Guest count cannot exceed 10").optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
