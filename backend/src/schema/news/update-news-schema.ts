import { z } from "zod";

// Empty string means "no image" (forms always submit "" for blank inputs)
const optionalUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().url("Invalid image URL").optional()
);

export const updateNewsSchema = z.object({
  body: z.object({
    id: z.string().uuid("Invalid news ID"),
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    summary: z.string().optional(),
    imageUrl: optionalUrl,
    isPublished: z.boolean().optional(),
  }),
});

export type UpdateNewsInput = z.infer<typeof updateNewsSchema>["body"];
