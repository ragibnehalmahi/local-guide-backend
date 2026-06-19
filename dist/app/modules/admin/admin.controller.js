"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getAllReviews = exports.updatePaymentStatus = exports.updateBookingStatus = exports.getBookingStats = exports.getAllBookings = exports.deleteListing = exports.updateListing = exports.getAllListings = exports.deleteUser = exports.updateUserRole = exports.updateUserStatus = exports.searchUserByEmail = exports.getAllUsers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const admin_service_1 = require("./admin.service");
// ============ USER MANAGEMENT ============
exports.getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getAllUsers(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Users fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});
exports.searchUserByEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.query;
    const user = await admin_service_1.AdminService.searchUserByEmail(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User found",
        data: user,
    });
});
exports.updateUserStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedUser = await admin_service_1.AdminService.updateUserStatus(id, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User status updated",
        data: updatedUser,
    });
});
exports.updateUserRole = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const updatedUser = await admin_service_1.AdminService.updateUserRole(id, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User role updated",
        data: updatedUser,
    });
});
exports.deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await admin_service_1.AdminService.deleteUser(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User deleted permanently",
        data: null,
    });
});
// ============ LISTING MANAGEMENT ============
exports.getAllListings = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getAllListings(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Listings fetched",
        meta: result.meta,
        data: result.data,
    });
});
exports.updateListing = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const updatedListing = await admin_service_1.AdminService.updateListing(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Listing updated",
        data: updatedListing,
    });
});
exports.deleteListing = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await admin_service_1.AdminService.deleteListing(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Listing deleted permanently",
        data: null,
    });
});
// ============ BOOKING MANAGEMENT ============
exports.getAllBookings = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getAllBookings(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Bookings fetched",
        meta: result.meta,
        data: result.data,
    });
});
exports.getBookingStats = (0, catchAsync_1.default)(async (req, res) => {
    const stats = await admin_service_1.AdminService.getBookingStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking stats fetched",
        data: stats,
    });
});
exports.updateBookingStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBooking = await admin_service_1.AdminService.updateBookingStatus(id, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Booking status updated",
        data: updatedBooking,
    });
});
exports.updatePaymentStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const updatedBooking = await admin_service_1.AdminService.updatePaymentStatus(id, paymentStatus);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Payment status updated",
        data: updatedBooking,
    });
});
// ============ REVIEW MANAGEMENT ============
exports.getAllReviews = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getAllReviews(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Reviews fetched",
        meta: result.meta,
        data: result.data,
    });
});
exports.updateReview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const updatedReview = await admin_service_1.AdminService.updateReview(id, { rating, comment });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Review updated",
        data: updatedReview,
    });
});
exports.deleteReview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await admin_service_1.AdminService.deleteReview(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Review deleted",
        data: null,
    });
});
