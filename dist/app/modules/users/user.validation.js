"use strict";
//local-guide-backend\src\app\modules\users\user.validation.ts          
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(["tourist", "guide", "admin"]).default("tourist"),
        bio: zod_1.z.string().max(500).optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        profilePicture: zod_1.z.string().url().optional(),
        expertise: zod_1.z.array(zod_1.z.enum([
            "History", "Food", "Art", "Adventure",
            "Nightlife", "Shopping", "Photography", "Nature"
        ])).optional(),
        dailyRate: zod_1.z.coerce.number().min(0).optional(),
        yearsOfExperience: zod_1.z.coerce.number().min(0).optional(),
        travelPreferences: zod_1.z.array(zod_1.z.string()).optional(),
        location: zod_1.z.object({
            addressLine1: zod_1.z.string(),
            addressLine2: zod_1.z.string().optional(),
            city: zod_1.z.string(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            coordinates: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).optional(),
        }).optional(),
    }),
});
exports.UpdateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().optional(),
        bio: zod_1.z.string().max(500).optional(),
        languages: zod_1.z.union([
            zod_1.z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
            zod_1.z.array(zod_1.z.string())
        ]).optional(),
        profilePicture: zod_1.z.string().url().optional(),
        expertise: zod_1.z.union([
            zod_1.z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
            zod_1.z.array(zod_1.z.enum(["History", "Food", "Art", "Adventure", "Nightlife", "Shopping", "Photography", "Nature"]))
        ]).optional(),
        dailyRate: zod_1.z.coerce.number().min(0).optional(),
        yearsOfExperience: zod_1.z.coerce.number().min(0).optional(),
        travelPreferences: zod_1.z.union([
            zod_1.z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
            zod_1.z.array(zod_1.z.string())
        ]).optional(),
        availableDates: zod_1.z.array(zod_1.z.string()).optional(),
        location: zod_1.z.object({
            addressLine1: zod_1.z.string().optional(),
            addressLine2: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            coordinates: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).optional(),
        }).optional(),
    }).partial(),
});
