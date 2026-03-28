import { Booking } from "../bookings/booking.model";
import { Listing } from "../listings/listing.model";
import { Review } from "../reviews/review.model";
import { User } from "../users/user.model";

// const getDashboardStats = async (userId: string, role: string) => {
//   if (role === "guide") {
//     const listings = await Listing.countDocuments({ guide: userId });
//     const bookings = await Booking.countDocuments({ guide: userId });
//     const revenue = await Booking.aggregate([
//       { $match: { guide: userId, paymentStatus: "PAID" } },
//       { $group: { _id: null, total: { $sum: "$totalPrice" } } },
//     ]);
//     return { listings, bookings, revenue: revenue[0]?.total || 0 };
//   } else if (role === "tourist") {
//     const bookings = await Booking.countDocuments({ tourist: userId });
//     const wishlist = await User.findById(userId).select("wishlist");
//     return { bookings, wishlistCount: wishlist?.wishlist?.length || 0 };
//   } else if (role === "admin") {
//     const users = await User.countDocuments();
//     const listings = await Listing.countDocuments();
//     const bookings = await Booking.countDocuments();
//     return { users, listings, bookings };
//   }
//   return {};
// };
 

const getDashboardStats = async (userId: string, role: string) => {
  if (role === "guide") {
    // 1. My Listings count
    const totalListings = await Listing.countDocuments({ guide: userId });

    // 2. Total Bookings count
    const totalBookings = await Booking.countDocuments({ guide: userId });

    // 3. Total Earnings (from completed tours)
    const revenue = await Booking.aggregate([
      { 
        $match: { 
          guide: userId, 
          status: "COMPLETED",
          paymentStatus: "PAID" 
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // 4. Pending Requests
    const pendingBookings = await Booking.countDocuments({ 
      guide: userId, 
      status: "PENDING" 
    });

    // 5. Upcoming Bookings (confirmed and future date)
    const upcomingTours = await Booking.countDocuments({
      guide: userId,
      status: "CONFIRMED",
      date: { $gte: new Date() }
    });

    // 6. Average Rating (from Review model)
    const reviewStats = await Review.aggregate([
      { $match: { guide: userId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    // 7. Recent Reviews
    const recentReviews = await Review.find({ guide: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("tourist", "name profilePicture")
      .lean();

    // 8. Recent Bookings (for quick list)
    const recentBookings = await Booking.find({ guide: userId })
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

  } else if (role === "tourist") {
    const totalBookings = await Booking.countDocuments({ tourist: userId });
    
    // Total Spent
    const totalSpentAggregation = await Booking.aggregate([
      {
        $match: {
          tourist: userId,
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
    const upcomingTours = await Booking.countDocuments({
      tourist: userId,
      status: 'CONFIRMED',
      date: { $gte: new Date() },
    });

    // Past Trips
    const completedTours = await Booking.countDocuments({
      tourist: userId,
      status: 'COMPLETED',
    });

    const wishlist = await User.findById(userId).select("wishlist");

    // Recent Bookings
    const recentBookings = await Booking.find({ tourist: userId })
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

  } else if (role === "admin") {
    const totalUsers = await User.countDocuments();
    const totalGuides = await User.countDocuments({ role: "GUIDE" });
    const totalTourists = await User.countDocuments({ role: "TOURIST" });
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const revenueStats = await Booking.aggregate([
      { $match: { paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Recent Activities (Combined Signups and Bookings)
    const recentSignups = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt")
      .lean();

    const recentBookings = await Booking.find({})
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

export const MetaService = {
  getDashboardStats,
};
 