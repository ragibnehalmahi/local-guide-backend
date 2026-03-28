"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
// src/app/modules/payments/payment.service.ts
const AppError_1 = __importDefault(require("../../utils/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const payment_model_1 = require("./payment.model");
const booking_model_1 = require("../bookings/booking.model");
const payment_interface_1 = require("./payment.interface");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
class PaymentService {
    static async initPayment(bookingId, touristId) {
        console.log("🚀 initPayment called with:", { bookingId, touristId });
        // 1. Find booking
        const booking = await booking_model_1.Booking.findById(bookingId).populate("tourist");
        if (!booking) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        }
        // ✅ Check authorization
        const bookingTouristId = booking.tourist._id?.toString ?
            booking.tourist._id.toString() :
            booking.tourist.toString();
        if (bookingTouristId !== touristId) {
            console.log("❌ Authorization failed");
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized");
        }
        if (booking.status !== booking_model_1.BookingStatus.CONFIRMED) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Booking must be confirmed before payment");
        }
        if (booking.paymentStatus === booking_model_1.PaymentStatus.PAID) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Booking already paid");
        }
        // 2. Generate transactionId
        const transactionId = `txn_${Date.now()}_${bookingId}`;
        // 3. Get tourist details
        const tourist = booking.tourist;
        // 4. Init SSL payment
        const sslPayload = {
            amount: booking.totalPrice,
            transactionId,
            name: tourist.name || "Customer",
            email: tourist.email || "customer@example.com",
            phoneNumber: tourist.phone || "01700000000",
            address: tourist.address || "Dhaka, Bangladesh",
        };
        console.log("📤 Calling SSLCommerz with:", sslPayload);
        const sslResponse = await sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        if (!sslResponse.GatewayPageURL) {
            throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "SSLCommerz did not return payment URL");
        }
        // 5. Save Payment entry
        await payment_model_1.Payment.create({
            booking: bookingId,
            tourist: touristId,
            amount: booking.totalPrice,
            status: payment_interface_1.PaymentStatus.PENDING,
            transactionId,
        });
        console.log("✅ Payment record created");
        return {
            redirectUrl: sslResponse.GatewayPageURL,
            transactionId
        };
    }
    static async handlePaymentCallback(transactionId, amount, status, val_id) {
        console.log("🎯 handlePaymentCallback called with:", { transactionId, amount, status, val_id });
        // 1. Find the payment
        const payment = await payment_model_1.Payment.findOne({ transactionId });
        if (!payment) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, `Payment not found: ${transactionId}`);
        }
        // 2. If already processed, return
        if (payment.status === payment_interface_1.PaymentStatus.PAID) {
            console.log("✅ Payment already processed as PAID");
            return payment;
        }
        // 3. Check if status is success
        if (status === "VALID" || status === "SUCCESS") {
            try {
                // 4. Validate payment with SSLCommerz
                console.log("🔍 Validating with SSLCommerz, val_id:", val_id);
                const validationResult = await sslCommerz_service_1.SSLService.validatePayment({ val_id });
                console.log("📦 Validation result:", validationResult);
                // ✅ Check validation
                if (!validationResult || validationResult.status !== "VALID") {
                    console.log("❌ SSLCommerz validation failed");
                    // Mark as failed
                    payment.status = payment_interface_1.PaymentStatus.FAILED;
                    await payment.save();
                    // Update booking
                    await booking_model_1.Booking.findByIdAndUpdate(payment.booking, { paymentStatus: booking_model_1.PaymentStatus.FAILED });
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment validation failed");
                }
                // 5. Update payment status
                payment.status = payment_interface_1.PaymentStatus.PAID;
                await payment.save();
                // 6. Update booking payment status
                await booking_model_1.Booking.findByIdAndUpdate(payment.booking, {
                    paymentStatus: booking_model_1.PaymentStatus.PAID,
                    status: booking_model_1.BookingStatus.CONFIRMED
                });
                console.log("✅ Payment and booking updated successfully");
                return payment;
            }
            catch (error) {
                console.error("❌ Payment validation error:", error.message);
                // Mark payment as failed
                payment.status = payment_interface_1.PaymentStatus.FAILED;
                await payment.save();
                throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, `Payment failed: ${error.message}`);
            }
        }
        else {
            // Payment failed
            console.log("❌ Payment failed, status:", status);
            payment.status = payment_interface_1.PaymentStatus.FAILED;
            await payment.save();
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment failed");
        }
    }
    static async handlePaymentFail(transactionId) {
        console.log("⚠️ handlePaymentFail called with:", transactionId);
        const payment = await payment_model_1.Payment.findOne({ transactionId });
        if (payment && payment.status !== payment_interface_1.PaymentStatus.PAID) {
            payment.status = payment_interface_1.PaymentStatus.FAILED;
            await payment.save();
            await booking_model_1.Booking.findByIdAndUpdate(payment.booking, { paymentStatus: booking_model_1.PaymentStatus.FAILED });
            console.log("✅ Payment marked as FAILED");
        }
        return payment;
    }
    static async checkPaymentStatus(transactionId, touristId) {
        const payment = await payment_model_1.Payment.findOne({
            transactionId,
            tourist: touristId
        });
        if (!payment) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment not found");
        }
        return {
            status: payment.status,
            amount: payment.amount,
            transactionId: payment.transactionId,
            bookingId: payment.booking,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
        };
    }
}
exports.PaymentService = PaymentService;
// import AppError from "../../utils/AppError";
// import httpStatus from "http-status-codes";
// import { Payment } from "./payment.model";
// import { Booking, BookingStatus, PaymentStatus as BookingPaymentStatus } from "../bookings/booking.model";
// import { PaymentStatus } from "./payment.interface";
// import { SSLService } from "../sslCommerz/sslCommerz.service";
// export class PaymentService {
//   static async initPayment(bookingId: string, touristId: string) {
//     console.log("DEBUG: initPayment called with bookingId:", bookingId, "touristId:", touristId);
//     // 1. Find booking (must be CONFIRMED)
//     const booking = await Booking.findById(bookingId).populate("tourist");
//     if (!booking) {
//       throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
//     }
//     // Fixed: Use _id.toString() for populated tourist object
//     if (!booking.tourist || booking.tourist._id.toString() !== touristId) {
//       console.log("DEBUG: Authorization failed");
//       throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
//     }
//     if (booking.status !== BookingStatus.CONFIRMED) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Booking must be confirmed before payment");
//     }
//     if (booking.paymentStatus === BookingPaymentStatus.PAID) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Already paid");
//     }
//     // 2. Generate transactionId
//     const transactionId = `txn_${Date.now()}_${bookingId}`;
//     // 3. Get tourist details
//     const tourist = booking.tourist as any;
//     // 4. Init SSL payment
//     const sslPayload = {
//       amount: booking.totalPrice,
//       transactionId,
//       name: tourist.name,
//       email: tourist.email,
//       phoneNumber: tourist.phone || "N/A",
//       address: tourist.address || "N/A",
//     };
//     const sslResponse = await SSLService.sslPaymentInit(sslPayload);
//     // 5. Save Payment entry
//     await Payment.create({
//       booking: bookingId,
//       tourist: touristId,
//       amount: booking.totalPrice,
//       status: PaymentStatus.PENDING,
//       transactionId,
//     });
//     return { 
//       redirectUrl: sslResponse.GatewayPageURL,
//       transactionId 
//     };
//   }
//   static async handlePaymentCallback(transactionId: string, amount: string, status: string, val_id: string) {
//     console.log("DEBUG: handlePaymentCallback called with:", { transactionId, amount, status, val_id });
//     // 1. Find the payment
//     const payment = await Payment.findOne({ transactionId });
//     if (!payment) {
//       throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
//     }
//     // 2. If already processed, return
//     if (payment.status === PaymentStatus.PAID) {
//       console.log("DEBUG: Payment already processed");
//       return payment;
//     }
//     // 3. Check if status is success
//     if (status === "success") {
//       try {
//         // 4. Validate payment with SSLCommerz (VERY IMPORTANT!)
//         console.log("DEBUG: Validating payment with SSLCommerz...");
//         const validationResult = await SSLService.validatePayment({ val_id });
//         if (!validationResult || validationResult.status !== "VALID") {
//           console.log("DEBUG: SSLCommerz validation failed");
//           throw new AppError(httpStatus.BAD_REQUEST, "Payment validation failed");
//         }
//         // 5. Update payment status
//         payment.status = PaymentStatus.PAID;
//         await payment.save();
//         // 6. Update booking payment status
//         await Booking.findByIdAndUpdate(
//           payment.booking, 
//           { 
//             paymentStatus: BookingPaymentStatus.PAID,
//             status: BookingStatus.CONFIRMED // Ensure booking stays confirmed
//           }
//         );
//         console.log("DEBUG: Payment and booking updated successfully");
//         return payment;
//       } catch (error: any) {
//         console.error("DEBUG: Error in payment validation:", error.message);
//         // Mark payment as failed
//         payment.status = PaymentStatus.FAILED;
//         await payment.save();
//         throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Payment failed: ${error.message}`);
//       }
//     } else {
//       // Payment failed
//       console.log("DEBUG: Payment failed, status:", status);
//       payment.status = PaymentStatus.FAILED;
//       await payment.save();
//       throw new AppError(httpStatus.BAD_REQUEST, "Payment failed");
//     }
//   }
//   static async handlePaymentFail(transactionId: string) {
//     console.log("DEBUG: handlePaymentFail called with transactionId:", transactionId);
//     const payment = await Payment.findOne({ transactionId });
//     if (payment) {
//       // Only update if not already PAID
//       if (payment.status !== PaymentStatus.PAID) {
//         payment.status = PaymentStatus.FAILED;
//         await payment.save();
//         // Also update booking if needed
//         await Booking.findByIdAndUpdate(
//           payment.booking,
//           { 
//             paymentStatus: BookingPaymentStatus.FAILED 
//           }
//         );
//       }
//     }
//   }
//   // NEW: Function to check payment status manually
//   static async checkPaymentStatus(transactionId: string, touristId: string) {
//     const payment = await Payment.findOne({ 
//       transactionId, 
//       tourist: touristId 
//     });
//     if (!payment) {
//       throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
//     }
//     return {
//       status: payment.status,
//       amount: payment.amount,
//       transactionId: payment.transactionId,
//       bookingId: payment.booking,
//       createdAt: payment.createdAt,
//       updatedAt: payment.updatedAt
//     };
//   }
// }
