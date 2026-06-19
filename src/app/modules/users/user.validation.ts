//local-guide-backend\src\app\modules\users\user.validation.ts          


import { z } from "zod";


export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z.enum(["tourist", "guide", "admin"]).default("tourist"),
    bio: z.string().max(500).optional(),
    languages: z.array(z.string()).optional(),
    profilePicture: z.string().url().optional(),
    expertise: z.array(z.enum([
      "History", "Food", "Art", "Adventure",
      "Nightlife", "Shopping", "Photography", "Nature"
    ])).optional(),
    dailyRate: z.coerce.number().min(0).optional(),
    yearsOfExperience: z.coerce.number().min(0).optional(),
    travelPreferences: z.array(z.string()).optional(),
    location: z.object({
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }).optional(),
  }),
});


export const UpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),


    languages: z.union([
      z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
      z.array(z.string())
    ]).optional(),

    profilePicture: z.string().url().optional(),

    expertise: z.union([
      z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
      z.array(z.enum(["History", "Food", "Art", "Adventure", "Nightlife", "Shopping", "Photography", "Nature"]))
    ]).optional(),

    dailyRate: z.coerce.number().min(0).optional(),
    yearsOfExperience: z.coerce.number().min(0).optional(),

    travelPreferences: z.union([
      z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
      z.array(z.string())
    ]).optional(),

    availableDates: z.array(z.string()).optional(),

    location: z.object({
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }).optional(),
  }).partial(),
});

