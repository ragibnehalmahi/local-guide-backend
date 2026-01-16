import { z } from "zod";
import { ListingCategory } from "./listing.interface";

const locationSchema = z.object({
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2)
});

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(1000),
    price: z.number().positive().min(1),
    durationHours: z.number().int().min(1).max(24),
    maxGroupSize: z.number().int().min(1).max(20),
    meetingPoint: z.string().min(5).max(200),
    languages: z.array(z.string()).min(1),
    category: z.nativeEnum(ListingCategory),
    images: z.array(z.string().url()).min(1).max(5),
    location: locationSchema,
    availableDates: z.array(z.coerce.date()).optional().default([])
  })
});

export const updateListingSchema = createListingSchema.partial();