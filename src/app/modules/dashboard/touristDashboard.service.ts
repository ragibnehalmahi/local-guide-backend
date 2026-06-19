import { BookingDocument } from './../bookings/booking.model';
// src/modules/dashboard/touristDashboard.service.ts
import { Types } from 'mongoose';
import { Booking } from '../bookings/booking.model';
import { Review } from '../reviews/review.model';
import { User } from '../users/user.model';

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

  async getTouristDashboardStats(userId: Types.ObjectId): Promise<{
    success: boolean;
    data: DashboardStats;
    message: string;
  }> {
    try {

      const touristId = typeof userId === 'string'
        ? new Types.ObjectId(userId)
        : userId;


      const totalBookings = await Booking.countDocuments({
        tourist: touristId,
      });


      const upcomingTours = await Booking.countDocuments({
        tourist: touristId,
        status: 'confirmed',
        date: { $gte: new Date() },
      });


      const completedTours = await Booking.countDocuments({
        tourist: touristId,
        status: 'completed',
      });


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


      const tourist = await User.findById(touristId)
        .select('wishlist')
        .populate({
          path: 'wishlist',
          select: '_id',
        });

      const wishlistCount = tourist?.wishlist?.length || 0;


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