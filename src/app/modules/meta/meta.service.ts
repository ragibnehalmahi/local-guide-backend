import { Booking } from "../bookings/booking.model";
import { Listing } from "../listings/listing.model";
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
    // ১. মোট লিস্টিং সংখ্যা
    const totalListings = await Listing.countDocuments({ guide: userId });

    // ২. মোট বুকিং সংখ্যা (সব ধরণের স্ট্যাটাস মিলিয়ে)
    const totalBookings = await Booking.countDocuments({ guide: userId });

    // ৩. মোট রেভিনিউ (শুধুমাত্র PAID এবং COMPLETED হলে ভালো, অথবা আপনার লজিক অনুযায়ী)
    const revenue = await Booking.aggregate([
      { $match: { guide: userId, paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // ৪. পেন্ডিং বুকিং (যেগুলো গাইডকে এখনও কনফার্ম করতে হবে)
    const pendingBookings = await Booking.countDocuments({ 
      guide: userId, 
      status: "PENDING" 
    });

    // ৫. আপকামিং ট্যুর (কনফার্ম করা হয়েছে কিন্তু তারিখ এখনও পার হয়নি)
    const upcomingTours = await Booking.countDocuments({
      guide: userId,
      status: "CONFIRMED",
      date: { $gte: new Date() }
    });

    // ৬. গাইডের এভারেজ রেটিং (সরাসরি ইউজার মডেল থেকে আনা হচ্ছে)
    const guideInfo = await User.findById(userId).select("rating");

    return { 
      totalListings, 
      totalBookings, 
      totalEarnings: revenue[0]?.total || 0,
      pendingBookings,
      upcomingTours,
      averageRating: guideInfo?.rating || 0
    };

  } else if (role === "tourist") {
    const bookings = await Booking.countDocuments({ tourist: userId });
    const wishlist = await User.findById(userId).select("wishlist");
    return { bookings, wishlistCount: wishlist?.wishlist?.length || 0 };

  } else if (role === "admin") {
    const users = await User.countDocuments();
    const listings = await Listing.countDocuments();
    const bookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    return { users, listings, bookings, totalRevenue: totalRevenue[0]?.total || 0 };
  }
  return {};
};

export const MetaService = {
  getDashboardStats,
};
 