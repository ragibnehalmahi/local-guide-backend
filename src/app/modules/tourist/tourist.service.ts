//local-guide-backend\src\app\modules\tourist\tourist.service.ts        

import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
import { User } from "../users/user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";
import { Review } from "../reviews/review.model";

export class TouristService {
  static async getTouristDashboardStats(touristId: string) {
    // 1. Check if user exists
    const tourist = await User.findById(touristId).select("wishlist name email");
    if (!tourist) {
      throw new AppError(httpStatus.NOT_FOUND, "Tourist not found");
    }

    // 2. All bookings
    const allBookings = await Booking.find({ tourist: touristId }).lean();

    // 3. Counts
    const totalBookings = allBookings.length;
    const now = new Date();
    const upcomingTours = allBookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED && new Date(b.date) >= now
    ).length;
    const completedTours = allBookings.filter(
      (b) => b.status === BookingStatus.COMPLETED
    ).length;

    // 4. Total spent
    const totalSpent = allBookings
      .filter((b) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);   // ✅ sum-এর টাইপ added

    // 5. Wishlist count
    const wishlistCount = tourist.wishlist?.length || 0;

    // 6. Average rating given by this tourist (to all guides)
    const reviewsByTourist = await Review
      .find({ tourist: touristId });
    let averageGuideRating = 0;
    if (reviewsByTourist.length > 0) {
      const totalRating = reviewsByTourist.reduce(
        (sum: number, r: any) => sum + r.rating, 0   // ✅ sum ও r-এর টাইপ added
      );
      averageGuideRating = parseFloat((totalRating / reviewsByTourist.length).toFixed(1));
    }

    // 7. Recent bookings
    const recentBookingsRaw = await Booking.find({ tourist: touristId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("listing", "title images price")
      .populate("guide", "name profilePicture rating")
      .lean();

    const recentBookings = recentBookingsRaw.map((booking: any) => ({
      _id: booking._id,
      tourTitle: booking.listing?.title || "Unknown Tour",
      tourImage: booking.listing?.images?.[0] || null,
      guide: {
        name: booking.guide?.name || "Guide",
        rating: booking.guide?.rating || 0,
      },
      date: booking.date,
      status: booking.status,
      totalPrice: booking.totalPrice,
      paymentStatus: booking.paymentStatus,
    }));

    return {
      totalBookings,
      upcomingTours,
      completedTours,
      totalSpent,
      wishlistCount,
      averageGuideRating,
      recentBookings,
    };
  }
}

