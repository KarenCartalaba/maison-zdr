import { z } from "zod";

export const createNewsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    summary: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    isPublished: z.boolean().optional(),
  }),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>["body"];
