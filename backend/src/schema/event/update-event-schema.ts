import { z } from "zod";
import { EventType } from "@/generated/prisma/enums";

export const updateEventSchema = z.object({
  body: z.object({
    id: z.string().uuid("Invalid event ID"),
    title: z.string().min(3).max(100, "Title must be at most 100 characters").optional(),
    description: z.string().min(10).max(5000, "Description must be at most 5000 characters").optional(),
    location: z.string().min(2).max(200, "Location must be at most 200 characters").optional(),
    eventDate: z.string().datetime().optional(),
    endDate: z.string().datetime("Invalid event end date").optional(),
    deadline: z.string().datetime().optional(),
    minParticipants: z.number().int().min(0).optional(),
    maxParticipants: z.number().int().min(1).optional(),
    // Canonical public categories only: FOOD / ARTS / GAMES / MUSIC / PERFORMANCE.
    eventType: z.nativeEnum(EventType).optional(),
    isCancelled: z.boolean().optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];
