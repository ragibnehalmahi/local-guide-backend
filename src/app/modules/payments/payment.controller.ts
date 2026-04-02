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
    let frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    if (frontendBase.includes("5000")) frontendBase = "http://localhost:3000"; // Fallback to prevent infinite loop/bad envs
    
    const frontendUrl = `${frontendBase}/payment/success?transactionId=${tran_id}&amount=${amount}&status=success`;
    console.log("🔀 Redirecting to:", frontendUrl);
    return res.redirect(frontendUrl);
    
  } catch (error: any) {
    console.error("❌ Error in payment success:", error.message);
    
    // Redirect to fail page
    let frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    if (frontendBase.includes("5000")) frontendBase = "http://localhost:3000"; // Fallback to prevent infinite loop/bad envs
    
    const failUrl = `${frontendBase}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=error&message=${encodeURIComponent(error.message)}`;
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

  let frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
  if (frontendBase.includes("5000")) frontendBase = "http://localhost:3000";

  const failUrl = `${frontendBase}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=failed`;
  return res.redirect(failUrl);
});

export const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const data = req.method === 'POST' ? req.body : req.query;
  const { tran_id, amount } = data;

  console.log("🚫 SSLCommerz Cancel Callback:", { tran_id, amount });

  if (tran_id) {
    await PaymentService.handlePaymentFail(tran_id as string);
  }

  let frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
  if (frontendBase.includes("5000")) frontendBase = "http://localhost:3000";

  const cancelUrl = `${frontendBase}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=cancelled`;
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


// import { Request, Response } from "express";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
// import { PaymentService } from "./payment.service";
// import httpStatus from "http-status-codes";

// export const initPayment = catchAsync(async (req: Request, res: Response) => {
//   const touristId = (req as any).user._id;
//   const { bookingId } = req.body;

//   const result = await PaymentService.initPayment(bookingId, touristId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Payment initiated successfully",
//     data: result,
//   });
// });

// // export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
// //   const { tran_id, amount, status, val_id } = req.query as any;

// //   console.log("DEBUG: Success callback received:", { tran_id, amount, status, val_id });

// //   try {
// //     const result = await PaymentService.handlePaymentCallback(tran_id, amount, status, val_id);
    
// //     // Redirect to frontend success page
// //     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?transactionId=${tran_id}&status=success`);
// //   } catch (error: any) {
// //     console.error("DEBUG: Error in success callback:", error.message);
// //     // Redirect to fail page if error occurs
// //     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail?transactionId=${tran_id}&error=${encodeURIComponent(error.message)}`);
// //   }
// // });
// export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
//   // SSLCommerz POST মেথডে ডাটা পাঠায়, তাই req.body চেক করা জরুরি
//   const { tran_id, amount, status, val_id } = req.method === 'POST' ? req.body : req.query;

//   console.log("DEBUG: Success callback received:", { tran_id, amount, status, val_id });

//   try {
//     // এখানে handlePaymentCallback কল হচ্ছে
//     await PaymentService.handlePaymentCallback(tran_id, amount, status, val_id);
    
//     // ফ্রন্টএন্ড সাকসেস পেজে রিডাইরেক্ট
//     res.redirect(`${process.env.FRONTEND_URL}/payment/success?transactionId=${tran_id}`);
//   } catch (error: any) {
//     res.redirect(`${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}`);
//   }
// });
// export const paymentFail = catchAsync(async (req: Request, res: Response) => {
//   const { tran_id } = req.query as any;

//   console.log("DEBUG: Fail callback received for transaction:", tran_id);

//   await PaymentService.handlePaymentFail(tran_id);

//   // Redirect to frontend fail page
//   res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail?transactionId=${tran_id}`);
// });

// export const paymentCancel = catchAsync(async (req: Request, res: Response) => {
//   const { tran_id } = req.query as any;

//   console.log("DEBUG: Cancel callback received for transaction:", tran_id);

//   await PaymentService.handlePaymentFail(tran_id);

//   // Redirect to frontend cancel page
//   res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?transactionId=${tran_id}`);
// });

// export const checkPaymentStatus = catchAsync(async (req: Request, res: Response) => {
//   const touristId = (req as any).user._id;
//   const { transactionId } = req.query as any;

//   if (!transactionId) {
//     throw new Error("Transaction ID is required");
//   }

//   const result = await PaymentService.checkPaymentStatus(transactionId, touristId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Payment status retrieved",
//     data: result,
//   });
// });

// export const PaymentController = {
//   initPayment,
//   paymentSuccess,
//   paymentFail,
//   paymentCancel,
//   checkPaymentStatus,
// };