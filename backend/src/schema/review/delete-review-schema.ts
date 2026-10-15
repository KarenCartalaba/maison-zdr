import { z } from "zod";

export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
});