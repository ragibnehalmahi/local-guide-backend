"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = exports.PaymentStatus = exports.BookingStatus = void 0;
const mongoose_1 = require("mongoose");
const booking_interface_1 = require("./booking.interface");
Object.defineProperty(exports, "BookingStatus", { enumerable: true, get: function () { return booking_interface_1.BookingStatus; } });
Object.defineProperty(exports, "PaymentStatus", { enumerable: true, get: function () { return booking_interface_1.PaymentStatus; } });
const BookingSchema = new mongoose_1.Schema({
    listing: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
        index: true
    },
    guide: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tourist: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    guestCount: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    status: {
        type: String,
        enum: Object.values(booking_interface_1.BookingStatus),
        default: booking_interface_1.BookingStatus.PENDING
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: Object.values(booking_interface_1.PaymentStatus),
        default: booking_interface_1.PaymentStatus.PENDING
    }
}, {
    timestamps: true
});
BookingSchema.index({ tourist: 1, status: 1 });
BookingSchema.index({ guide: 1, status: 1 });
BookingSchema.index({ listing: 1, date: 1 });
exports.Booking = (0, mongoose_1.model)("Booking", BookingSchema);
