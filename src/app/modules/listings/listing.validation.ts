// src/app/modules/listings/listing.validation.ts

import { z } from "zod";
import { ListingCategory } from "./listing.interface";

// Simple location schema
const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required")
});

// ============ CREATE LISTING SCHEMA ============
export const createListingSchema = z.object({
  body: z.object({
    // Basic info
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    
    // Numbers
    price: z.number().positive("Price must be positive"),
    durationHours: z.number().int().positive("Duration is required"),
    maxGroupSize: z.number().int().positive("Group size is required"),
    
    // Strings
    meetingPoint: z.string().min(1, "Meeting point is required"),
    category: z.nativeEnum(ListingCategory),
    
    // Arrays
    languages: z.array(z.string()).min(1, "At least one language required"),
    images: z.array(z.string()).min(1, "At least one image required").max(10, "Maximum 10 images"),
    
    // Location object
    location: locationSchema,
    
    // Optional
    availableDates: z.array(z.string()).optional().default([])
  })
});

// ============ UPDATE LISTING SCHEMA ============
export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    durationHours: z.number().int().positive().optional(),
    maxGroupSize: z.number().int().positive().optional(),
    meetingPoint: z.string().min(1).optional(),
    category: z.nativeEnum(ListingCategory).optional(),
    languages: z.array(z.string()).min(1).optional(),
    images: z.array(z.string()).min(1).max(10).optional(),
    location: locationSchema.partial().optional(),
    availableDates: z.array(z.string()).optional()
  })
});