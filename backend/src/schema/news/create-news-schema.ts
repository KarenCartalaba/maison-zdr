import { z } from "zod";

// Empty string means "no image" (forms always submit "" for blank inputs)
const optionalUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().url("Invalid image URL").optional()
);

export const createNewsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
    content: z.string().min(10, "Content must be at least 10 characters").max(10000, "Content must be at most 10000 characters"),
    summary: z.string().optional(),
    imageUrl: optionalUrl,
    isPublished: z.boolean().optional(),
  }),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>["body"];
