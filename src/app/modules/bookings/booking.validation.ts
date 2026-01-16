import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    listingId: z.string().min(1, "Listing ID is required"),
    date: z.coerce.date().min(new Date(), "Date must be in the future"),
    guestCount: z.number().int().min(1).max(20, "Guest count must be between 1 and 20")
  })
});