"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouristDashboardService = void 0;
// src/modules/dashboard/touristDashboard.service.ts
const mongoose_1 = require("mongoose");
const booking_model_1 = require("../bookings/booking.model");
const review_model_1 = require("../reviews/review.model");
const user_model_1 = require("../users/user.model");
class TouristDashboardService {
    /**
     * Get tourist dashboard statistics
     */
    async getTouristDashboardStats(userId) {
        try {
            // Convert userId to ObjectId if it's a string
            const touristId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            // 1. Get total bookings count
            const totalBookings = await booking_model_1.Booking.countDocuments({
                tourist: touristId,
            });
            // 2. Get upcoming tours (confirmed bookings with future dates)
            const upcomingTours = await booking_model_1.Booking.countDocuments({
                tourist: touristId,
                status: 'confirmed',
                date: { $gte: new Date() },
            });
            // 3. Get completed tours
            const completedTours = await booking_model_1.Booking.countDocuments({
                tourist: touristId,
                status: 'completed',
            });
            // 4. Calculate total spent (sum of all completed booking amounts)
            const totalSpentAggregation = await booking_model_1.Booking.aggregate([
                {
                    $match: {
                        tourist: touristId,
                        status: 'completed',
                        paymentStatus: 'paid',
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalPrice' },
                    },
                },
            ]);
            const totalSpent = totalSpentAggregation[0]?.total || 0;
            // 5. Get wishlist count
            const tourist = await user_model_1.User.findById(touristId)
                .select('wishlist')
                .populate({
                path: 'wishlist',
                select: '_id',
            });
            const wishlistCount = tourist?.wishlist?.length || 0;
            // 6. Calculate average guide rating given by tourist
            const reviewAggregation = await review_model_1.Review.aggregate([
                {
                    $match: {
                        tourist: touristId,
                    },
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                    },
                },
            ]);
            const averageGuideRating = reviewAggregation[0]?.averageRating || 0;
            // 7. Get recent bookings (last 5 bookings)
            const recentBookings = await booking_model_1.Booking.find({
                tourist: touristId,
            })
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
                .select('status date totalPrice createdAt')
                .lean();
            // Format recent bookings
            const formattedRecentBookings = recentBookings.map((booking) => ({
                id: booking._id,
                tourTitle: booking.listing?.title || 'N/A',
                guideName: booking.guide?.name || 'N/A',
                guideImage: booking.guide?.profilePicture || null,
                status: booking.status,
                date: booking.date,
                totalPrice: booking.totalPrice,
                createdAt: booking.createdAt,
            }));
            const dashboardStats = {
                totalBookings,
                upcomingTours,
                completedTours,
                totalSpent,
                wishlistCount,
                averageGuideRating: parseFloat(averageGuideRating.toFixed(1)),
                recentBookings: formattedRecentBookings,
            };
            return {
                success: true,
                data: dashboardStats,
                message: 'Dashboard stats retrieved successfully',
            };
        }
        catch (error) {
            console.error('Error in getTouristDashboardStats:', error);
            // Return default stats in case of error
            const defaultStats = {
                totalBookings: 0,
                upcomingTours: 0,
                completedTours: 0,
                totalSpent: 0,
                wishlistCount: 0,
                averageGuideRating: 0,
                recentBookings: [],
            };
            return {
                success: false,
                data: defaultStats,
                message: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
            };
        }
    }
}
exports.TouristDashboardService = TouristDashboardService;
exports.default = new TouristDashboardService();
