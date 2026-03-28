"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
// CreateUserSchema এখন validateRequest মিডলওয়্যারের প্রত্যাশিত ফরম্যাট মেনে চলে,
// যেখানে পুরো রিকোয়েস্ট বডিটি একটি টপ-লেভেলের 'body' অবজেক্টের মধ্যে মোড়ানো থাকে।
exports.CreateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            error: "Name is required for creation" // যখন name দেওয়া না হয়
        }).min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(["tourist", "guide", "admin"]).default("tourist"),
        bio: zod_1.z.string().max(500).optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        profilePicture: zod_1.z.string().url("Profile picture must be a valid URL").optional(),
        // Guide-specific fields
        expertise: zod_1.z.array(zod_1.z.enum([
            "History", "Food", "Art", "Adventure",
            "Nightlife", "Shopping", "Photography", "Nature"
        ])).optional(),
        dailyRate: zod_1.z.number().min(0, "Daily rate cannot be negative").optional(),
        yearsOfExperience: zod_1.z.number().min(0, "Years of experience cannot be negative").optional(),
        // Tourist-specific fields
        travelPreferences: zod_1.z.array(zod_1.z.string()).optional(),
        // Location
        location: zod_1.z.object({
            addressLine1: zod_1.z.string(),
            addressLine2: zod_1.z.string().optional(),
            city: zod_1.z.string(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            coordinates: zod_1.z.object({
                lat: zod_1.z.number(),
                lng: zod_1.z.number(),
            }).optional(),
        }).optional(),
    }),
});
exports.UpdateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
        phone: zod_1.z.string().optional(),
        bio: zod_1.z.string().max(500, "Bio must be 500 characters or less").optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        profilePicture: zod_1.z.string().url("Profile picture must be a valid URL").optional(),
        // Guide-specific fields
        expertise: zod_1.z.array(zod_1.z.enum([
            "History", "Food", "Art", "Adventure",
            "Nightlife", "Shopping", "Photography", "Nature"
        ])).optional(),
        dailyRate: zod_1.z.number().min(0, "Daily rate cannot be negative").optional(),
        yearsOfExperience: zod_1.z.number().min(0, "Years of experience cannot be negative").optional(),
        // availableDates: এখানে .date() এর বদলে .string() ব্যবহার করা ভালো কারণ JSON এ স্ট্রিং হিসেবে আসে
        availableDates: zod_1.z.array(zod_1.z.string()).optional(),
        // Tourist-specific fields
        travelPreferences: zod_1.z.array(zod_1.z.string()).optional(),
        // Location
        location: zod_1.z.object({
            addressLine1: zod_1.z.string().optional(), // এগুলোকে অপশনাল করে দিন
            addressLine2: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            coordinates: zod_1.z.object({
                lat: zod_1.z.number(),
                lng: zod_1.z.number(),
            }).optional(),
        }).optional(),
    }).partial(), // সরাসরি বডি অবজেক্টকে পার্শিয়াল করা হলো
});
// UpdateUserSchema-ও একইভাবে 'body' প্রপার্টির মধ্যে মোড়ানো
// export const UpdateUserSchema = z.object({
//   body: z.object({ // <--- validateRequest এর 'body' প্রপার্টিকে target করে
//     name: z.string().min(2, "Name must be at least 2 characters").optional(),
//     phone: z.string().optional(),
//     bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
//     languages: z.array(z.string()).optional(),
//     profilePicture: z.string().url("Profile picture must be a valid URL").optional(),
//     
//     // Guide-specific fields
//     expertise: z.array(z.enum([
//       "History", "Food", "Art", "Adventure", 
//       "Nightlife", "Shopping", "Photography", "Nature"
//     ])).optional(),
//     dailyRate: z.number().min(0, "Daily rate cannot be negative").optional(),
//     yearsOfExperience: z.number().min(0, "Years of experience cannot be negative").optional(),
//     availableDates: z.array(z.date()).optional(),
//     
//     // Tourist-specific fields
//     travelPreferences: z.array(z.string()).optional(),
//     
//     // Location
//     location: z.object({
//       addressLine1: z.string(),
//       addressLine2: z.string().optional(),
//       city: z.string(),
//       state: z.string().optional(),
//       postalCode: z.string().optional(),
//       country: z.string().optional(),
//       coordinates: z.object({
//         lat: z.number(),
//         lng: z.number(),
//       }).optional(),
//     }).optional(),
//   }).partial(), // Update এর জন্য সমস্ত ফিল্ড ঐচ্ছিক (Optional) করা হয়েছে
// });
