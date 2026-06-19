"use strict";
//local-guide-backend\src\app\modules\meta\meta.service.ts    
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
const booking_model_1 = require("../bookings/booking.model");
const listing_model_1 = require("../listings/listing.model");
const review_model_1 = require("../reviews/review.model");
const user_model_1 = require("../users/user.model");
const mongoose_1 = require("mongoose");
const getDashboardStats = async (userId, role) => {
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    if (role === "guide") {
        // 1. My Listings count
        const totalListings = await listing_model_1.Listing.countDocuments({ guide: userId });
        // 2. Total Bookings count
        const totalBookings = await booking_model_1.Booking.countDocuments({ guide: userId });
        // 3. Total Earnings (from completed tours)
        const revenue = await booking_model_1.Booking.aggregate([
            {
                $match: {
                    guide: userObjectId,
                    status: "COMPLETED",
                    paymentStatus: "PAID"
                }
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]);
        // 4. Pending Requests
        const pendingBookings = await booking_model_1.Booking.countDocuments({
            guide: userId,
            status: "PENDING"
        });
        // 5. Upcoming Bookings (confirmed and future date)
        const upcomingTours = await booking_model_1.Booking.countDocuments({
            guide: userId,
            status: "CONFIRMED",
            date: { $gte: new Date() }
        });
        // 6. Average Rating (from Review model)
        const reviewStats = await review_model_1.Review.aggregate([
            { $match: { guide: userObjectId } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);
        // 7. Recent Reviews
        const recentReviews = await review_model_1.Review.find({ guide: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("tourist", "name profilePicture")
            .lean();
        // 8. Recent Bookings (for quick list)
        const recentBookings = await booking_model_1.Booking.find({ guide: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("tourist", "name")
            .lean();
        return {
            totalListings,
            totalBookings,
            totalEarnings: revenue[0]?.total || 0,
            pendingBookings,
            upcomingTours,
            averageRating: reviewStats[0]?.avgRating || 0,
            recentReviews,
            recentBookings
        };
    }
    else if (role === "tourist") {
        const totalBookings = await booking_model_1.Booking.countDocuments({ tourist: userId });
        // Total Spent
        const totalSpentAggregation = await booking_model_1.Booking.aggregate([
            {
                $match: {
                    tourist: userObjectId,
                    paymentStatus: 'PAID',
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' },
                },
            },
        ]);
        // Upcoming Trips
        const upcomingTours = await booking_model_1.Booking.countDocuments({
            tourist: userId,
            status: 'CONFIRMED',
            date: { $gte: new Date() },
        });
        // Past Trips
        const completedTours = await booking_model_1.Booking.countDocuments({
            tourist: userId,
            status: 'COMPLETED',
        });
        const wishlist = await user_model_1.User.findById(userId).select("wishlist");
        // Recent Bookings
        const recentBookings = await booking_model_1.Booking.find({ tourist: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
            path: 'listing',
            select: 'title images',
        })
            .populate({
            path: 'guide',
            select: 'name profilePicture',
        })
            .lean();
        return {
            totalBookings,
            totalSpent: totalSpentAggregation[0]?.total || 0,
            upcomingTours,
            completedTours,
            wishlistCount: wishlist?.wishlist?.length || 0,
            recentBookings
        };
    }
    else if (role === "admin") {
        const totalUsers = await user_model_1.User.countDocuments();
        const totalGuides = await user_model_1.User.countDocuments({ role: "GUIDE" });
        const totalTourists = await user_model_1.User.countDocuments({ role: "TOURIST" });
        const totalListings = await listing_model_1.Listing.countDocuments();
        const totalBookings = await booking_model_1.Booking.countDocuments();
        const revenueStats = await booking_model_1.Booking.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]);
        // Recent Activities (Combined Signups and Bookings)
        const recentSignups = await user_model_1.User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email role createdAt")
            .lean();
        const recentBookings = await booking_model_1.Booking.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("tourist", "name")
            .populate("guide", "name")
            .lean();
        return {
            totalUsers,
            totalGuides,
            totalTourists,
            totalListings,
            totalBookings,
            totalRevenue: revenueStats[0]?.total || 0,
            recentSignups,
            recentBookings
        };
    }
    return {};
};
exports.MetaService = {
    getDashboardStats,
};
