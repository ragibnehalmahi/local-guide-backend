"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const payment_interface_1 = require("./payment.interface");
const PaymentSchema = new mongoose_1.Schema({
    booking: { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", required: true },
    tourist: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(payment_interface_1.PaymentStatus),
        default: payment_interface_1.PaymentStatus.PENDING,
    },
    transactionId: { type: String, required: true },
}, { timestamps: true });
exports.Payment = (0, mongoose_1.model)("Payment", PaymentSchema);
