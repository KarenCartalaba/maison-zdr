import { z } from "zod";
import { EventType } from "@/generated/prisma/enums";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location is required"),
    eventDate: z.string().datetime("Invalid event date"),
    deadline: z.string().datetime("Invalid deadline"),
    minParticipants: z.number().int().min(0, "Minimum participants must be at least 0"),
    maxParticipants: z.number().int().min(1, "Maximum participants must be at least 1"),
    eventType: z.nativeEnum(EventType).optional().default("SOCIAL"),
    gallery: z.array(z.string()).optional(),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];
