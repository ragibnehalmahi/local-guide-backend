"use strict";
// src/app/modules/listings/listing.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateListingSchema = exports.createListingSchema = void 0;
const zod_1 = require("zod");
const listing_interface_1 = require("./listing.interface");
// Simple location schema
const locationSchema = zod_1.z.object({
    address: zod_1.z.string().min(1, "Address is required"),
    city: zod_1.z.string().min(1, "City is required"),
    country: zod_1.z.string().min(1, "Country is required")
});
// ============ CREATE LISTING SCHEMA ============
exports.createListingSchema = zod_1.z.object({
    body: zod_1.z.object({
        // Basic info
        title: zod_1.z.string().min(1, "Title is required"),
        description: zod_1.z.string().min(1, "Description is required"),
        // Numbers
        price: zod_1.z.number().positive("Price must be positive"),
        durationHours: zod_1.z.number().int().positive("Duration is required"),
        maxGroupSize: zod_1.z.number().int().positive("Group size is required"),
        // Strings
        meetingPoint: zod_1.z.string().min(1, "Meeting point is required"),
        category: zod_1.z.nativeEnum(listing_interface_1.ListingCategory),
        // Arrays
        languages: zod_1.z.array(zod_1.z.string()).min(1, "At least one language required"),
        images: zod_1.z.array(zod_1.z.string()).min(1, "At least one image required").max(10, "Maximum 10 images"),
        // Location object
        location: locationSchema,
        // Optional
        availableDates: zod_1.z.array(zod_1.z.string()).optional().default([])
    })
});
// ============ UPDATE LISTING SCHEMA ============
exports.updateListingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().min(1).optional(),
        price: zod_1.z.number().positive().optional(),
        durationHours: zod_1.z.number().int().positive().optional(),
        maxGroupSize: zod_1.z.number().int().positive().optional(),
        meetingPoint: zod_1.z.string().min(1).optional(),
        category: zod_1.z.nativeEnum(listing_interface_1.ListingCategory).optional(),
        languages: zod_1.z.array(zod_1.z.string()).min(1).optional(),
        images: zod_1.z.array(zod_1.z.string()).min(1).max(10).optional(),
        location: locationSchema.partial().optional(),
        availableDates: zod_1.z.array(zod_1.z.string()).optional()
    })
});
