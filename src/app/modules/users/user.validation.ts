import { z } from "zod";

// CreateUserSchema এখন validateRequest মিডলওয়্যারের প্রত্যাশিত ফরম্যাট মেনে চলে,
// যেখানে পুরো রিকোয়েস্ট বডিটি একটি টপ-লেভেলের 'body' অবজেক্টের মধ্যে মোড়ানো থাকে।
export const CreateUserSchema = z.object({
  body: z.object({ // <--- validateRequest এর 'body' প্রপার্টিকে target করে
    name: z.string({
      error: "Name is required for creation" // যখন name দেওয়া না হয়
    }).min(2, "Name must be at least 2 characters"), 
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z.enum(["tourist", "guide","admin"]).default("tourist"),
    bio: z.string().max(500).optional(),
    languages: z.array(z.string()).optional(),
    profilePicture: z.string().url("Profile picture must be a valid URL").optional(),
    
    // Guide-specific fields
    expertise: z.array(z.enum([
      "History", "Food", "Art", "Adventure", 
      "Nightlife", "Shopping", "Photography", "Nature"
    ])).optional(),
    dailyRate: z.number().min(0, "Daily rate cannot be negative").optional(),
    yearsOfExperience: z.number().min(0, "Years of experience cannot be negative").optional(),
    
    // Tourist-specific fields
    travelPreferences: z.array(z.string()).optional(),
    
    // Location
    location: z.object({
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }).optional(),
  }),
});
export const UpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
    languages: z.array(z.string()).optional(),
    profilePicture: z.string().url("Profile picture must be a valid URL").optional(),
    
    // Guide-specific fields
    expertise: z.array(z.enum([
      "History", "Food", "Art", "Adventure", 
      "Nightlife", "Shopping", "Photography", "Nature"
    ])).optional(),
    dailyRate: z.number().min(0, "Daily rate cannot be negative").optional(),
    yearsOfExperience: z.number().min(0, "Years of experience cannot be negative").optional(),
    
    // availableDates: এখানে .date() এর বদলে .string() ব্যবহার করা ভালো কারণ JSON এ স্ট্রিং হিসেবে আসে
    availableDates: z.array(z.string()).optional(), 
    
    // Tourist-specific fields
    travelPreferences: z.array(z.string()).optional(),
    
    // Location
    location: z.object({
      addressLine1: z.string().optional(), // এগুলোকে অপশনাল করে দিন
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
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