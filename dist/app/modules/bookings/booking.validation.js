"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        listingId: zod_1.z.string().min(1, "Listing ID is required"),
        date: zod_1.z.coerce.date().min(new Date(), "Date must be in the future"),
        guestCount: zod_1.z.number().int().min(1).max(20, "Guest count must be between 1 and 20")
    })
});
