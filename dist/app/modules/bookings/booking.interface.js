"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["DECLINED"] = "DECLINED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
