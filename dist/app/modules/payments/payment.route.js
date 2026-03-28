"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
// src/app/modules/payments/payment.routes.ts
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
// import { validateRequest } from  "../../middlewares/validateRequest";
const payment_validation_1 = require("./payment.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
// ✅ Tourist only - Init payment
router.post("/init", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), (0, validateRequest_1.default)(payment_validation_1.initPaymentSchema), payment_controller_1.PaymentController.initPayment);
// ✅ Check payment status
router.get("/status", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), payment_controller_1.PaymentController.checkPaymentStatus);
// ✅ SSLCommerz callbacks (no auth needed)
// GET routes (SSLCommerz uses GET for redirects)
router.get("/success", payment_controller_1.PaymentController.paymentSuccess);
router.get("/fail", payment_controller_1.PaymentController.paymentFail);
router.get("/cancel", payment_controller_1.PaymentController.paymentCancel);
// POST routes (SSLCommerz IPN/validation uses POST)
router.post("/success", payment_controller_1.PaymentController.paymentSuccess);
router.post("/fail", payment_controller_1.PaymentController.paymentFail);
router.post("/cancel", payment_controller_1.PaymentController.paymentCancel);
exports.PaymentRouter = router;
// import express from "express";
// import { PaymentController } from "./payment.controller";
// import { authGuard } from "../../middlewares/authGuard";
// import { UserRole } from "../users/user.interface";
// const router = express.Router();
// // Tourist only
// router.post(
//   "/init",
//   authGuard(UserRole.TOURIST),
//   PaymentController.initPayment
// );
// // Check payment status
// router.get(
//   "/status",
//   authGuard(UserRole.TOURIST),
//   PaymentController.checkPaymentStatus
// );
// // SSLCommerz callbacks (no auth needed)
// router.post("/success", PaymentController.paymentSuccess);
// router.post("/fail", PaymentController.paymentFail);
// router.post("/cancel", PaymentController.paymentCancel);
// router.get("/success", PaymentController.paymentSuccess); // GET also
// router.get("/fail", PaymentController.paymentFail); // GET also
// router.get("/cancel", PaymentController.paymentCancel); // GET also
// export const PaymentRouter = router;
