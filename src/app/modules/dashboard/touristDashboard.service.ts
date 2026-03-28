import { BookingDocument } from './../bookings/booking.model';
// src/modules/dashboard/touristDashboard.service.ts
import { Types } from 'mongoose';
import {Booking }from   '../bookings/booking.model';
import {Review} from '../reviews/review.model';
import{ User} from '../users/user.model';

interface DashboardStats {
  totalBookings: number;
  upcomingTours: number;
  completedTours: number;
  totalSpent: number;
  wishlistCount: number;
  averageGuideRating: number;
  recentBookings: any[];
}

export class TouristDashboardService {
  /**
   * Get tourist dashboard statistics
   */
  async getTouristDashboardStats(userId: Types.ObjectId): Promise<{
    success: boolean;
    data: DashboardStats;
    message: string;
  }> {
    try {
      // Convert userId to ObjectId if it's a string
      const touristId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      // 1. Get total bookings count
      const totalBookings = await Booking.countDocuments({
        tourist: touristId,
      });

      // 2. Get upcoming tours (confirmed bookings with future dates)
      const upcomingTours = await Booking.countDocuments({
        tourist: touristId,
        status: 'confirmed',
        date: { $gte: new Date() },
      });

      // 3. Get completed tours
      const completedTours = await Booking.countDocuments({
        tourist: touristId,
        status: 'completed',
      });

      // 4. Calculate total spent (sum of all completed booking amounts)
      const totalSpentAggregation = await Booking.aggregate([
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
      const tourist = await User.findById(touristId)
        .select('wishlist')
        .populate({
          path: 'wishlist',
          select: '_id',
        });

      const wishlistCount = tourist?.wishlist?.length || 0;

      // 6. Calculate average guide rating given by tourist
      const reviewAggregation = await Review.aggregate([
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
      const recentBookings = await Booking.find({
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
        .lean() as any[];

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

      const dashboardStats: DashboardStats = {
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

    } catch (error) {
      console.error('Error in getTouristDashboardStats:', error);
      
      // Return default stats in case of error
      const defaultStats: DashboardStats = {
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

export default new TouristDashboardService();