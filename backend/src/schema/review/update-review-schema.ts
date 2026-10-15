import { z } from "zod";

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
  body: z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    // null clears a previously saved title (the form sends null for an empty field)
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be at most 100 characters")
      .nullable()
      .optional(),
    comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be at most 1000 characters"),
  }),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>["body"];