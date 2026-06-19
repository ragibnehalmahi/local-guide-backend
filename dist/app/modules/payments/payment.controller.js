"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = exports.checkPaymentStatus = exports.paymentCancel = exports.paymentFail = exports.paymentSuccess = exports.initPayment = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const payment_service_1 = require("./payment.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
exports.initPayment = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const { bookingId } = req.body;
    const result = await payment_service_1.PaymentService.initPayment(bookingId, touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
});
exports.paymentSuccess = (0, catchAsync_1.default)(async (req, res) => {
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
        await payment_service_1.PaymentService.handlePaymentCallback(tran_id, amount, status, val_id);
        // ✅ Redirect to frontend success page
        const frontendUrl = `${process.env.FRONTEND_URL}/payment/success?transactionId=${tran_id}&amount=${amount}&status=success`;
        console.log("🔀 Redirecting to:", frontendUrl);
        return res.redirect(frontendUrl);
    }
    catch (error) {
        console.error("❌ Error in payment success:", error.message);
        // Redirect to fail page
        const failUrl = `${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=error&message=${encodeURIComponent(error.message)}`;
        return res.redirect(failUrl);
    }
});
exports.paymentFail = (0, catchAsync_1.default)(async (req, res) => {
    const data = req.method === 'POST' ? req.body : req.query;
    const { tran_id, amount } = data;
    console.log("❌ SSLCommerz Fail Callback:", { tran_id, amount });
    if (tran_id) {
        await payment_service_1.PaymentService.handlePaymentFail(tran_id);
    }
    const failUrl = `${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=failed`;
    return res.redirect(failUrl);
});
exports.paymentCancel = (0, catchAsync_1.default)(async (req, res) => {
    const data = req.method === 'POST' ? req.body : req.query;
    const { tran_id, amount } = data;
    console.log("🚫 SSLCommerz Cancel Callback:", { tran_id, amount });
    if (tran_id) {
        await payment_service_1.PaymentService.handlePaymentFail(tran_id);
    }
    const cancelUrl = `${process.env.FRONTEND_URL}/payment/fail?transactionId=${tran_id}&amount=${amount}&status=cancelled`;
    return res.redirect(cancelUrl);
});
exports.checkPaymentStatus = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const { transactionId } = req.query;
    if (!transactionId) {
        throw new Error("Transaction ID is required");
    }
    const result = await payment_service_1.PaymentService.checkPaymentStatus(transactionId, touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payment status retrieved",
        data: result,
    });
});
exports.PaymentController = {
    initPayment: exports.initPayment,
    paymentSuccess: exports.paymentSuccess,
    paymentFail: exports.paymentFail,
    paymentCancel: exports.paymentCancel,
    checkPaymentStatus: exports.checkPaymentStatus,
};
