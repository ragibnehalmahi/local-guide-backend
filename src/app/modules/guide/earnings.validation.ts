import { z } from "zod";

export const guideEarningsValidation = {
  getHistory: z.object({
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    })
  })
};
