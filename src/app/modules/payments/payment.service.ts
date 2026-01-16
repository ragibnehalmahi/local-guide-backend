import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";
import { Payment } from "./payment.model";
import { Booking, BookingStatus, PaymentStatus as BookingPaymentStatus } from "../bookings/booking.model";
import { PaymentStatus } from "./payment.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";

export class PaymentService {
  static async initPayment(bookingId: string, touristId: string) {
    console.log("DEBUG: initPayment called with bookingId:", bookingId, "touristId:", touristId);

    // 1. Find booking (must be CONFIRMED)
    const booking = await Booking.findById(bookingId).populate("tourist");

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Fixed: Use _id.toString() for populated tourist object
    if (!booking.tourist || booking.tourist._id.toString() !== touristId) {
      console.log("DEBUG: Authorization failed");
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Booking must be confirmed before payment");
    }

    if (booking.paymentStatus === BookingPaymentStatus.PAID) {
      throw new AppError(httpStatus.BAD_REQUEST, "Already paid");
    }

    // 2. Generate transactionId
    const transactionId = `txn_${Date.now()}_${bookingId}`;

    // 3. Get tourist details
    const tourist = booking.tourist as any;

    // 4. Init SSL payment
    const sslPayload = {
      amount: booking.totalPrice,
      transactionId,
      name: tourist.name,
      email: tourist.email,
      phoneNumber: tourist.phone || "N/A",
      address: tourist.address || "N/A",
    };

    const sslResponse = await SSLService.sslPaymentInit(sslPayload);

    // 5. Save Payment entry
    await Payment.create({
      booking: bookingId,
      tourist: touristId,
      amount: booking.totalPrice,
      status: PaymentStatus.PENDING,
      transactionId,
    });

    return { 
      redirectUrl: sslResponse.GatewayPageURL,
      transactionId 
    };
  }

  static async handlePaymentCallback(transactionId: string, amount: string, status: string, val_id: string) {
    console.log("DEBUG: handlePaymentCallback called with:", { transactionId, amount, status, val_id });
    
    // 1. Find the payment
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    // 2. If already processed, return
    if (payment.status === PaymentStatus.PAID) {
      console.log("DEBUG: Payment already processed");
      return payment;
    }

    // 3. Check if status is success
    if (status === "success") {
      try {
        // 4. Validate payment with SSLCommerz (VERY IMPORTANT!)
        console.log("DEBUG: Validating payment with SSLCommerz...");
        const validationResult = await SSLService.validatePayment({ val_id });
        
        if (!validationResult || validationResult.status !== "VALID") {
          console.log("DEBUG: SSLCommerz validation failed");
          throw new AppError(httpStatus.BAD_REQUEST, "Payment validation failed");
        }

        // 5. Update payment status
        payment.status = PaymentStatus.PAID;
        await payment.save();

        // 6. Update booking payment status
        await Booking.findByIdAndUpdate(
          payment.booking, 
          { 
            paymentStatus: BookingPaymentStatus.PAID,
            status: BookingStatus.CONFIRMED // Ensure booking stays confirmed
          }
        );

        console.log("DEBUG: Payment and booking updated successfully");
        return payment;
      } catch (error: any) {
        console.error("DEBUG: Error in payment validation:", error.message);
        
        // Mark payment as failed
        payment.status = PaymentStatus.FAILED;
        await payment.save();
        
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Payment failed: ${error.message}`);
      }
    } else {
      // Payment failed
      console.log("DEBUG: Payment failed, status:", status);
      payment.status = PaymentStatus.FAILED;
      await payment.save();
      
      throw new AppError(httpStatus.BAD_REQUEST, "Payment failed");
    }
  }

  static async handlePaymentFail(transactionId: string) {
    console.log("DEBUG: handlePaymentFail called with transactionId:", transactionId);
    
    const payment = await Payment.findOne({ transactionId });
    
    if (payment) {
      // Only update if not already PAID
      if (payment.status !== PaymentStatus.PAID) {
        payment.status = PaymentStatus.FAILED;
        await payment.save();
        
        // Also update booking if needed
        await Booking.findByIdAndUpdate(
          payment.booking,
          { 
            paymentStatus: BookingPaymentStatus.FAILED 
          }
        );
      }
    }
  }

  // NEW: Function to check payment status manually
  static async checkPaymentStatus(transactionId: string, touristId: string) {
    const payment = await Payment.findOne({ 
      transactionId, 
      tourist: touristId 
    });

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
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