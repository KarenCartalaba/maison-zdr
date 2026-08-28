import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters").optional(),
    comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be at most 1000 characters"),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
