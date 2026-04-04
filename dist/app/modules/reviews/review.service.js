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
    // Check if booking exists
    const booking = await booking_model_1.Booking.findById(bookingId);
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    // Verify ownership
    if (booking.tourist.toString() !== touristId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not your booking");
    }
    // Verify booking is completed
    if (booking.status !== "COMPLETED") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cannot review - tour not completed");
    }
    // Check if review already exists
    const existingReview = await review_model_1.Review.findOne({ booking: bookingId });
    if (existingReview) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Review already submitted for this booking");
    }
    // Create review
    const review = await review_model_1.Review.create({
        tourist: touristId,
        guide: booking.guide,
        booking: bookingId,
        rating,
        comment,
    });
    // Update guide's average rating
    const reviews = await review_model_1.Review.find({ guide: booking.guide });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await user_model_1.User.findByIdAndUpdate(booking.guide, { rating: avgRating });
    return review;
};
const getReviewsByGuide = async (guideId) => {
    return review_model_1.Review.find({ guide: guideId })
        .populate("tourist", "name profilePicture")
        .sort({ createdAt: -1 });
};
const getMyReviews = async (touristId) => {
    return review_model_1.Review.find({ tourist: touristId })
        .populate({
        path: "booking",
        populate: {
            path: "listing",
            select: "title"
        }
    })
        .populate("guide", "name profilePicture")
        .sort({ createdAt: -1 });
};
// ✅ New: Get completed bookings for review
const getCompletedBookingsForReview = async (touristId) => {
    // Get all completed bookings
    const completedBookings = await booking_model_1.Booking.find({
        tourist: touristId,
        status: "COMPLETED"
    }).populate({
        path: "listing",
        select: "title images price location"
    }).populate({
        path: "guide",
        select: "name profilePicture"
    });
    // Get already reviewed bookings
    const reviewedBookings = await review_model_1.Review.find({ tourist: touristId }).select("booking");
    const reviewedBookingIds = reviewedBookings.map(r => r.booking.toString());
    // Filter out already reviewed bookings
    const pendingReviews = completedBookings.filter(booking => !reviewedBookingIds.includes(booking._id.toString()));
    return pendingReviews;
};
// ✅ New: Update review
const updateReview = async (reviewId, payload) => {
    const review = await review_model_1.Review.findById(reviewId);
    if (!review) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
    }
    const updatedReview = await review_model_1.Review.findByIdAndUpdate(reviewId, { rating: payload.rating, comment: payload.comment }, { new: true, runValidators: true });
    // Recalculate guide rating
    const reviews = await review_model_1.Review.find({ guide: review.guide });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await user_model_1.User.findByIdAndUpdate(review.guide, { rating: avgRating });
    return updatedReview;
};
// ✅ New: Delete review
const deleteReview = async (reviewId) => {
    const review = await review_model_1.Review.findById(reviewId);
    if (!review) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
    }
    await review_model_1.Review.findByIdAndDelete(reviewId);
    // Recalculate guide rating
    const reviews = await review_model_1.Review.find({ guide: review.guide });
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    await user_model_1.User.findByIdAndUpdate(review.guide, { rating: avgRating });
    return null;
};
exports.ReviewService = {
    createReview,
    getReviewsByGuide,
    getMyReviews,
    getCompletedBookingsForReview,
    updateReview,
    deleteReview,
};
