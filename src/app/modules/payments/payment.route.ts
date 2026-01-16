import express from "express";
import { PaymentController } from "./payment.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";

const router = express.Router();

// Tourist only
router.post(
  "/init",
  authGuard(UserRole.TOURIST),
  PaymentController.initPayment
);

// Check payment status
router.get(
  "/status",
  authGuard(UserRole.TOURIST),
  PaymentController.checkPaymentStatus
);

// SSLCommerz callbacks (no auth needed)
router.post("/success", PaymentController.paymentSuccess);
router.post("/fail", PaymentController.paymentFail);
router.post("/cancel", PaymentController.paymentCancel);
router.get("/success", PaymentController.paymentSuccess); // GET also
router.get("/fail", PaymentController.paymentFail); // GET also
router.get("/cancel", PaymentController.paymentCancel); // GET also

export const PaymentRouter = router;