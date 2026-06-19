"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
// import { User, UserRole, UserStatus } from "../users/user.model";
const listing_model_1 = require("../listings/listing.model");
const booking_model_1 = require("../bookings/booking.model");
const review_model_1 = require("../reviews/review.model");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../users/user.model");
const user_interface_1 = require("../users/user.interface");
class AdminService {
    // ============ USER MANAGEMENT ============
    static async getAllUsers(query) {
        const { search, role, status, page = 1, limit = 10 } = query;
        const filter = { isDeleted: false };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const data = await user_model_1.User.find(filter)
            .select("-password")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await user_model_1.User.countDocuments(filter);
        return {
            data,
            meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
        };
    }
    static async searchUserByEmail(email) {
        if (!email)
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email required");
        const user = await user_model_1.User.findOne({ email: { $regex: `^${email}$`, $options: "i" } }).select("-password");
        if (!user)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        return user;
    }
    static async updateUserStatus(userId, status) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        if (!Object.values(user_interface_1.UserStatus).includes(status))
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid status");
        user.status = status;
        await user.save();
        return user;
    }
    static async updateUserRole(userId, role) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        if (!Object.values(user_interface_1.UserRole).includes(role))
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid role");
        if (user.role === user_interface_1.UserRole.SUPER_ADMIN)
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cannot change Super Admin role");
        user.role = role;
        await user.save();
        return user;
    }
    static async deleteUser(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        if (user.role === user_interface_1.UserRole.SUPER_ADMIN)
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cannot delete Super Admin");
        // Optional: delete all related listings and bookings
        await user_model_1.User.findByIdAndDelete(userId);
        // Cascade (optional)
        await listing_model_1.Listing.deleteMany({ guide: userId });
        await booking_model_1.Booking.deleteMany({ $or: [{ tourist: userId }, { guide: userId }] });
        await review_model_1.Review.deleteMany({ $or: [{ tourist: userId }, { guide: userId }] });
    }
    // ============ LISTING MANAGEMENT ============
    static async getAllListings(query) {
        const { search, category, city, status, page = 1, limit = 10 } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (category)
            filter.category = category;
        if (city)
            filter["location.city"] = { $regex: city, $options: "i" };
        if (status === "active")
            filter.active = true;
        if (status === "inactive")
            filter.active = false;
        const skip = (Number(page) - 1) * Number(limit);
        const data = await listing_model_1.Listing.find(filter)
            .populate("guide", "name email")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await listing_model_1.Listing.countDocuments(filter);
        return { data, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
    }
    static async updateListing(listingId, payload) {
        const listing = await listing_model_1.Listing.findById(listingId);
        if (!listing)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found");
        const updated = await listing_model_1.Listing.findByIdAndUpdate(listingId, payload, { new: true, runValidators: true });
        return updated;
    }
    static async deleteListing(listingId) {
        const listing = await listing_model_1.Listing.findById(listingId);
        if (!listing)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found");
        await listing_model_1.Listing.findByIdAndDelete(listingId);
        // Optionally delete related bookings
        await booking_model_1.Booking.deleteMany({ listing: listingId });
    }
    // ============ BOOKING MANAGEMENT ============
    static async getAllBookings(query) {
        const { status, paymentStatus, page = 1, limit = 10 } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        const skip = (Number(page) - 1) * Number(limit);
        const data = await booking_model_1.Booking.find(filter)
            .populate("tourist", "name email")
            .populate("guide", "name email")
            .populate("listing", "title price")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await booking_model_1.Booking.countDocuments(filter);
        return { data, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
    }
    static async getBookingStats() {
        const total = await booking_model_1.Booking.countDocuments();
        const pending = await booking_model_1.Booking.countDocuments({ status: booking_model_1.BookingStatus.PENDING });
        const confirmed = await booking_model_1.Booking.countDocuments({ status: booking_model_1.BookingStatus.CONFIRMED });
        const completed = await booking_model_1.Booking.countDocuments({ status: booking_model_1.BookingStatus.COMPLETED });
        const cancelled = await booking_model_1.Booking.countDocuments({ status: booking_model_1.BookingStatus.CANCELLED });
        const paid = await booking_model_1.Booking.countDocuments({ paymentStatus: booking_model_1.PaymentStatus.PAID });
        const unpaid = await booking_model_1.Booking.countDocuments({ paymentStatus: { $in: ["PENDING", "FAILED"] } });
        const revenueAgg = await booking_model_1.Booking.aggregate([
            { $match: { paymentStatus: booking_model_1.PaymentStatus.PAID } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        return { total, pending, confirmed, completed, cancelled, paid, unpaid, totalRevenue };
    }
    static async updateBookingStatus(bookingId, status) {
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        if (!Object.values(booking_model_1.BookingStatus).includes(status))
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid status");
        booking.status = status;
        await booking.save();
        return booking.populate(["tourist", "guide", "listing"]);
    }
    static async updatePaymentStatus(bookingId, paymentStatus) {
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        if (!Object.values(booking_model_1.PaymentStatus).includes(paymentStatus))
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid payment status");
        booking.paymentStatus = paymentStatus;
        await booking.save();
        return booking;
    }
    // ============ REVIEW MANAGEMENT ============
    static async getAllReviews(query) {
        const { rating, page = 1, limit = 10 } = query;
        const filter = {};
        if (rating)
            filter.rating = Number(rating);
        const skip = (Number(page) - 1) * Number(limit);
        const data = await review_model_1.Review.find(filter)
            .populate("tourist", "name email")
            .populate("guide", "name email")
            .populate("booking", "_id")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await review_model_1.Review.countDocuments(filter);
        return { data, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
    }
    static async updateReview(reviewId, payload) {
        const review = await review_model_1.Review.findById(reviewId);
        if (!review)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
        const updated = await review_model_1.Review.findByIdAndUpdate(reviewId, payload, { new: true, runValidators: true });
        const guideReviews = await review_model_1.Review.find({ guide: review.guide });
        const avgRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length;
        await user_model_1.User.findByIdAndUpdate(review.guide, { rating: parseFloat(avgRating.toFixed(1)) });
        return updated;
    }
    static async deleteReview(reviewId) {
        const review = await review_model_1.Review.findById(reviewId);
        if (!review)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
        await review_model_1.Review.findByIdAndDelete(reviewId);
        const guideReviews = await review_model_1.Review.find({ guide: review.guide });
        const avgRating = guideReviews.length ? guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length : 0;
        await user_model_1.User.findByIdAndUpdate(review.guide, { rating: parseFloat(avgRating.toFixed(1)) });
    }
}
exports.AdminService = AdminService;
