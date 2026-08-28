import { z } from "zod";

export const updateEventSchema = z.object({
  body: z.object({
    id: z.string().uuid("Invalid event ID"),
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    eventDate: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    minParticipants: z.number().int().min(0).optional(),
    maxParticipants: z.number().int().min(1).optional(),
    isCancelled: z.boolean().optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];
