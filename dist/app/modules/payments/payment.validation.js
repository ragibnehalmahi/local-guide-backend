"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPaymentSchema = void 0;
const zod_1 = require("zod");
exports.initPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, "Booking ID is required")
    })
});
