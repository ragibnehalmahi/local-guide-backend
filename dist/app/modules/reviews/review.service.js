"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_model_1 = require("./review.model");
const booking_model_1 = require("../bookings/booking.model");
const user_model_1 = require("../users/user.model");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createReview = async (touristId, payload) => {
    const { bookingId, rating, comment } = payload;
    const booking = await booking_model_1.Booking.findById(bookingId);
    if (!booking)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    if (booking.tourist.toString() !== touristId || booking.status !== "COMPLETED")
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cannot review");
    const review = await review_model_1.Review.create({
        tourist: touristId,
        guide: booking.guide,
        booking: bookingId,
        rating,
        comment,
    });
    // Update guide rating
    const reviews = await review_model_1.Review.find({ guide: booking.guide });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await user_model_1.User.findByIdAndUpdate(booking.guide, { rating: avgRating });
    return review;
};
const getReviewsByGuide = async (guideId) => {
    return review_model_1.Review.find({ guide: guideId }).populate("tourist", "name").sort({ createdAt: -1 });
};
exports.ReviewService = {
    createReview,
    getReviewsByGuide,
};
