// src/app/modules/payments/payment.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status-codes";

export const initPayment = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;
  const { bookingId } = req.body;

  const result = await PaymentService.initPayment(bookingId, touristId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  // ✅ SSLCommerz POST method এ data পাঠায়
  const data = req.method === 'POST' ? req.body : req.query;
  const { tran_id, amount, status, val_id } = data;

  console.log("✅ SSLCommerz Success Callback:", {
    method: req.method,
    tran_id,
    amount,
    status,
    val_id
  });

  try {
    // Process payment
    await PaymentService.handlePaymentCallback(
      tran_id as string,
      amount as string,
      status as string,
      val_id as string
    );

    // ✅ Redirect to frontend success page
    const frontendUrl = `${process.env.FRONTEND_URL}/payment/success?transactionId=${tran_id}&amount=${amount}&status=success`;
    console.log("🔀 Redirecting to:", frontendUrl);
    return res.redirect(frontendUrl);

  } catch (error: any) {
    console.error("❌ Error in payment success:", error.message);

    // Redirect to fail page
    const failUrl = `${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=error&message=${encodeURIComponent(error.message)}`;
    return res.redirect(failUrl);
  }
});

export const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const data = req.method === 'POST' ? req.body : req.query;
  const { tran_id, amount } = data;

  console.log("❌ SSLCommerz Fail Callback:", { tran_id, amount });

  if (tran_id) {
    await PaymentService.handlePaymentFail(tran_id as string);
  }

  const failUrl = `${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=failed`;
  return res.redirect(failUrl);
});

export const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const data = req.method === 'POST' ? req.body : req.query;
  const { tran_id, amount } = data;

  console.log("🚫 SSLCommerz Cancel Callback:", { tran_id, amount });

  if (tran_id) {
    await PaymentService.handlePaymentFail(tran_id as string);
  }

  const cancelUrl = `${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=cancelled`;
  return res.redirect(cancelUrl);
});

export const checkPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;
  const { transactionId } = req.query as any;

  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }

  const result = await PaymentService.checkPaymentStatus(transactionId, touristId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status retrieved",
    data: result,
  });
});

export const PaymentController = {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  checkPaymentStatus,
};

