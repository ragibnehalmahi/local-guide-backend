// src/app/modules/payments/payment.routes.ts
import express from "express";
import { PaymentController } from "./payment.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
// import { validateRequest } from  "../../middlewares/validateRequest";
import { initPaymentSchema } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

// ✅ Tourist only - Init payment
router.post(
  "/init",
  authGuard(UserRole.TOURIST),
  validateRequest(initPaymentSchema),
  PaymentController.initPayment
);

// ✅ Check payment status
router.get(
  "/status",
  authGuard(UserRole.TOURIST),
  PaymentController.checkPaymentStatus
);

// ✅ SSLCommerz callbacks (no auth needed)
// GET routes (SSLCommerz uses GET for redirects)
router.get("/success", PaymentController.paymentSuccess);
router.get("/fail", PaymentController.paymentFail);
router.get("/cancel", PaymentController.paymentCancel);

// POST routes (SSLCommerz IPN/validation uses POST)
router.post("/success", PaymentController.paymentSuccess);
router.post("/fail", PaymentController.paymentFail);
router.post("/cancel", PaymentController.paymentCancel);

export const PaymentRouter = router;

