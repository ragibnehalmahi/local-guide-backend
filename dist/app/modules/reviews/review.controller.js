"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const review_service_1 = require("./review.service");
const createReview = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const result = await review_service_1.ReviewService.createReview(touristId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Review submitted",
        data: result,
    });
});
const getReviewsForGuide = (0, catchAsync_1.default)(async (req, res) => {
    const result = await review_service_1.ReviewService.getReviewsByGuide(req.params.guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Reviews fetched",
        data: result,
    });
});
const getMyReviews = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const result = await review_service_1.ReviewService.getMyReviews(touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My reviews fetched successfully",
        data: result,
    });
});
// ✅ New: Get completed bookings for review
const getCompletedBookings = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user._id;
    const result = await review_service_1.ReviewService.getCompletedBookingsForReview(touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Completed bookings fetched successfully",
        data: result,
    });
});
// ✅ New: Update review (Admin only)
const updateReview = (0, catchAsync_1.default)(async (req, res) => {
    const { reviewId } = req.params;
    const result = await review_service_1.ReviewService.updateReview(reviewId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Review updated successfully",
        data: result,
    });
});
// ✅ New: Delete review (Admin only)
const deleteReview = (0, catchAsync_1.default)(async (req, res) => {
    const { reviewId } = req.params;
    await review_service_1.ReviewService.deleteReview(reviewId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Review deleted successfully",
        data: null,
    });
});
exports.ReviewController = {
    createReview,
    getReviewsForGuide,
    getMyReviews,
    getCompletedBookings,
    updateReview,
    deleteReview,
};
