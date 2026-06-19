//local-guide-backend\src\app\modules\reviews\reviews.validation.ts       

import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(5),
  }),
});