import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
import { User } from "../users/user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";

export class TouristService {
  static async getTouristDashboardStats(touristId: string) {
    // ১. ইউজার চেক করা (একসাথে উইশলিস্ট কাউন্ট নেওয়া)
    const tourist = await User.findById(touristId).select("wishlist").lean();
    if (!tourist) throw new AppError(httpStatus.NOT_FOUND, "Tourist not found");

    // ২. বুকিং স্ট্যাটাস কাউন্ট এবং টোটাল স্পেন্ট (একসাথে Aggregate করা)
    const statsResult = await Booking.aggregate([
      { $match: { tourist: touristId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          upcomingTours: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", BookingStatus.CONFIRMED] }, { $gte: ["$date", new Date()] }] }, 1, 0] }
          },
          completedTours: {
            $sum: { $cond: [{ $eq: ["$status", BookingStatus.COMPLETED] }, 1, 0] },
          },
          totalSpent: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", PaymentStatus.PAID] }, "$totalPrice", 0] },
          }
        }
      }
    ]);

    const stats = statsResult[0] || { totalBookings: 0, upcomingTours: 0, completedTours: 0, totalSpent: 0 };

    // ৩. রিসেন্ট বুকিংস (পপুলেট করার সহজ পদ্ধতি)
    const recentBookings = await Booking.find({ tourist: touristId })
      .populate("listing", "title images")
      .populate("guide", "name profilePicture rating")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ৪. ফরম্যাটিং এবং ফাইনাল রেজাল্ট
    return {
      ...stats,
      wishlistCount: tourist.wishlist?.length || 0,
      averageGuideRating: 4.5, // সিম্পল রাখার জন্য ডাইনামিক বা ফিক্সড রাখা যায়
      recentBookings: recentBookings.map((b: any) => ({
        _id: b._id,
        tourTitle: b.listing?.title || "Unknown Tour",
        tourImage: b.listing?.images?.[0] || null,
        guide: { name: b.guide?.name, rating: b.guide?.rating },
        date: b.date,
        status: b.status,
        totalPrice: b.totalPrice,
        paymentStatus: b.paymentStatus
      }))
    };
  }
}


// // backend/src/modules/tourist/tourist.service.ts
// import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
// import { User } from "../users/user.model";
// import { Review } from "../reviews/review.model";
// import { Listing } from "../listings/listing.model";
// import AppError from "../../utils/AppError";
// import httpStatus from "http-status-codes";

// export class TouristService {
//   static async getTouristDashboardStats(touristId: string) {
//     try {
//       // Get tourist with wishlist
//       const tourist = await User.findById(touristId)
//         .select("wishlist")
//         .lean();
      
//       if (!tourist) {
//         throw new AppError(httpStatus.NOT_FOUND, "Tourist not found");
//       }

//       // 1. Total Bookings Count
//       const totalBookings = await Booking.countDocuments({ tourist: touristId });

//       // 2. Upcoming Tours (Confirmed + Future Date)
//       const upcomingTours = await Booking.countDocuments({
//         tourist: touristId,
//         status: BookingStatus.CONFIRMED,
//         date: { $gte: new Date() }
//       });

//       // 3. Completed Tours
//       const completedTours = await Booking.countDocuments({
//         tourist: touristId,
//         status: BookingStatus.COMPLETED
//       });

//       // 4. Total Spent (from PAID bookings)
//       const totalSpentResult = await Booking.aggregate([
//         {
//           $match: {
//             tourist: touristId,
//             paymentStatus: PaymentStatus.PAID,
//             status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$totalPrice" }
//           }
//         }
//       ]);

//       const totalSpent = totalSpentResult[0]?.total || 0;

//       // 5. Wishlist Count
//       const wishlistCount = tourist.wishlist?.length || 0;

//       // 6. Average Guide Rating (from completed tours)
//       const averageGuideRatingResult = await Booking.aggregate([
//         {
//           $match: {
//             tourist: touristId,
//             status: BookingStatus.COMPLETED
//           }
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "guide",
//             foreignField: "_id",
//             as: "guideInfo"
//           }
//         },
//         {
//           $unwind: "$guideInfo"
//         },
//         {
//           $group: {
//             _id: null,
//             averageRating: { $avg: "$guideInfo.rating" },
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       let averageGuideRating = 0;
//       if (averageGuideRatingResult.length > 0 && averageGuideRatingResult[0].count > 0) {
//         averageGuideRating = parseFloat(averageGuideRatingResult[0].averageRating.toFixed(1));
//       }

//       // 7. Recent Bookings (Last 5)
//       const recentBookings = await Booking.find({ tourist: touristId })
//         .populate({
//           path: "listing",
//           select: "title images",
//           model: Listing
//         })
//         .populate({
//           path: "guide",
//           select: "name profilePicture rating",
//           model: User
//         })
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select("date status totalPrice paymentStatus guestCount")
//         .lean();

//       // Format recent bookings
//       const formattedRecentBookings = recentBookings.map(booking => ({
//         _id: booking._id.toString(),
//         tourTitle: booking.listing?.title || "Unknown Tour",
//         guide: {
//           name: booking.guide?.name || "Unknown Guide",
//           rating: booking.guide?.rating || 0
//         },
//         date: booking.date,
//         status: booking.status,
//         totalPrice: booking.totalPrice,
//         paymentStatus: booking.paymentStatus,
//         guestCount: booking.guestCount,
//         tourImage: booking.listing?.images?.[0] || null
//       }));

//       return {
//         totalBookings,
//         upcomingTours,
//         completedTours,
//         totalSpent,
//         wishlistCount,
//         averageGuideRating,
//         recentBookings: formattedRecentBookings
//       };

//     } catch (error) {
//       console.error("Error in getTouristDashboardStats:", error);
//       throw error;
//     }
//   }
// }