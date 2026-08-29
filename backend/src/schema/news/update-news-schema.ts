import { z } from "zod";

export const updateNewsSchema = z.object({
  body: z.object({
    id: z.string().uuid("Invalid news ID"),
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    summary: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    isPublished: z.boolean().optional(),
  }),
});

export type UpdateNewsInput = z.infer<typeof updateNewsSchema>["body"];
