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

// export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
//   const { tran_id, amount, status, val_id } = req.query as any;

//   console.log("DEBUG: Success callback received:", { tran_id, amount, status, val_id });

//   try {
//     const result = await PaymentService.handlePaymentCallback(tran_id, amount, status, val_id);
    
//     // Redirect to frontend success page
//     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?transactionId=${tran_id}&status=success`);
//   } catch (error: any) {
//     console.error("DEBUG: Error in success callback:", error.message);
//     // Redirect to fail page if error occurs
//     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail?transactionId=${tran_id}&error=${encodeURIComponent(error.message)}`);
//   }
// });
export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  // SSLCommerz POST মেথডে ডাটা পাঠায়, তাই req.body চেক করা জরুরি
  const { tran_id, amount, status, val_id } = req.method === 'POST' ? req.body : req.query;

  console.log("DEBUG: Success callback received:", { tran_id, amount, status, val_id });

  try {
    // এখানে handlePaymentCallback কল হচ্ছে
    await PaymentService.handlePaymentCallback(tran_id, amount, status, val_id);
    
    // ফ্রন্টএন্ড সাকসেস পেজে রিডাইরেক্ট
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?transactionId=${tran_id}`);
  } catch (error: any) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}`);
  }
});
export const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query as any;

  console.log("DEBUG: Fail callback received for transaction:", tran_id);

  await PaymentService.handlePaymentFail(tran_id);

  // Redirect to frontend fail page
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail?transactionId=${tran_id}`);
});

export const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query as any;

  console.log("DEBUG: Cancel callback received for transaction:", tran_id);

  await PaymentService.handlePaymentFail(tran_id);

  // Redirect to frontend cancel page
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?transactionId=${tran_id}`);
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