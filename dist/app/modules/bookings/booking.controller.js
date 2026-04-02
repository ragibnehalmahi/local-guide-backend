"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = exports.BookingControllers = exports.completeBooking = exports.cancelBooking = exports.declineBooking = exports.confirmBooking = exports.getBookingsForGuide = exports.getMyBookings = exports.getCompletedBookingsForTourist = exports.getBookingById = exports.createBooking = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const booking_service_1 = __importStar(require("./booking.service"));
const booking_interface_1 = require("./booking.interface");
const AppError_1 = __importDefault(require("../../utils/AppError"));
exports.createBooking = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const { listingId, date, guestCount } = req.body;
    const booking = await booking_service_1.default.createBooking({ listingId, date: new Date(date), guestCount }, touristId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Booking created successfully",
        data: booking
    });
});
exports.getBookingById = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const booking = await booking_service_1.default.getBookingById(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking retrieved successfully",
        data: booking
    });
});
exports.getCompletedBookingsForTourist = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const bookings = await booking_service_1.default.getCompletedBookingsForTourist(touristId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your completed bookings retrieved successfully",
        data: bookings
    });
});
exports.getMyBookings = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const bookings = await booking_service_1.default.getMyBookings(touristId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your bookings retrieved successfully",
        data: bookings
    });
});
exports.getBookingsForGuide = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    const bookings = await booking_service_1.default.getBookingsForGuide(guideId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Guide bookings retrieved successfully",
        data: bookings
    });
});
exports.confirmBooking = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    const { id } = req.params;
    const booking = await booking_service_1.default.updateBookingStatus(id, guideId, booking_interface_1.BookingStatus.CONFIRMED);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking confirmed successfully",
        data: booking
    });
});
exports.declineBooking = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    const { id } = req.params;
    const booking = await booking_service_1.default.updateBookingStatus(id, guideId, booking_interface_1.BookingStatus.DECLINED);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking declined successfully",
        data: booking
    });
});
exports.cancelBooking = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    await booking_service_1.default.cancelBooking(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking cancelled successfully",
        data: null
    });
});
exports.completeBooking = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    const { id } = req.params;
    const booking = await booking_service_1.default.completeBooking(id, guideId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking completed successfully",
        data: booking
    });
});
// Get all bookings (Admin only) - SIMPLE
// Get all bookings for admin
const getAllBookingsForAdmin = (0, catchAsync_1.default)(async (req, res) => {
    const result = await booking_service_1.BookingServices.getAllBookingsForAdmin();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Bookings fetched successfully",
        data: result.bookings,
        meta: {
            totalBookings: result.totalBookings,
            paidBookings: result.paidBookings,
            unpaidBookings: result.unpaidBookings,
            totalRevenue: result.totalRevenue
        }
    });
});
// Get booking statistics for admin
const getBookingStatsForAdmin = (0, catchAsync_1.default)(async (req, res) => {
    const stats = await booking_service_1.BookingServices.getBookingStatsForAdmin();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking stats fetched successfully",
        data: stats,
    });
});
// Get booking by ID for admin
const getBookingByIdForAdmin = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const booking = await booking_service_1.BookingServices.getBookingByIdForAdmin(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking details fetched successfully",
        data: booking,
    });
});
// Update booking status (Admin only)
const updateBookingStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Status is required");
    }
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid status value");
    }
    const updatedBooking = await booking_service_1.BookingServices.updateBookingStatus(id, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking status updated successfully",
        data: updatedBooking,
    });
});
// Update payment status (Admin only)
const updatePaymentStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment status is required");
    }
    const validPaymentStatuses = ["PAID", "UNPAID", "REFUNDED"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid payment status value");
    }
    const updatedBooking = await booking_service_1.BookingServices.updatePaymentStatus(id, paymentStatus);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Payment status updated successfully",
        data: updatedBooking,
    });
});
exports.BookingControllers = {
    getAllBookingsForAdmin,
    getBookingStatsForAdmin,
    getBookingByIdForAdmin,
    updateBookingStatus,
    updatePaymentStatus,
};
exports.BookingController = {
    createBooking: exports.createBooking,
    getBookingById: exports.getBookingById,
    getMyBookings: exports.getMyBookings,
    getCompletedBookingsForTourist: exports.getCompletedBookingsForTourist,
    getBookingsForGuide: exports.getBookingsForGuide,
    confirmBooking: exports.confirmBooking,
    declineBooking: exports.declineBooking,
    cancelBooking: exports.cancelBooking,
    completeBooking: exports.completeBooking,
    getAllBookingsForAdmin,
};
