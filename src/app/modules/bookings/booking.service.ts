import httpStatus from "http-status-codes";
import { IBooking, BookingStatus, PaymentStatus } from "./booking.interface";
import { Booking } from "./booking.model";
import { Listing } from "../listings/listing.model";
import { User } from "../users/user.model";
import AppError from "../../utils/AppError";

interface CreateBookingPayload {
  listingId: string;
  date: Date;
  guestCount: number;
}

class BookingService {
  async createBooking(payload: CreateBookingPayload, touristId: string): Promise<IBooking> {
    const { listingId, date, guestCount } = payload;

    console.log("DEBUG: createBooking service called with listingId:", listingId, "touristId:", touristId);  // Optional debug log
    const listing = await Listing.findById(listingId);
    if (!listing || !listing.active) {
      throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    }

    const tourist = await User.findById(touristId);
    if (!tourist || tourist.role !== "tourist") {
      throw new AppError(httpStatus.FORBIDDEN, "Only tourists can book");
    }

    const isAvailable = listing.availableDates.some(d => 
      d.toDateString() === date.toDateString()
    );
    if (!isAvailable) {
      throw new AppError(httpStatus.BAD_REQUEST, "Date not available");
    }

    if (guestCount > listing.maxGroupSize) {
      throw new AppError(httpStatus.BAD_REQUEST, "Group size exceeds maximum");
    }

    const totalPrice = listing.price * guestCount;

    const booking = await Booking.create({
      listing: listingId,
      guide: listing.guide,
      tourist: touristId,
      date,
      guestCount,
      totalPrice
    });

    listing.availableDates = listing.availableDates.filter(d => 
      d.toDateString() !== date.toDateString()
    );
    await listing.save();

    return booking.populate("listing guide tourist");
  }

  async getBookingById(id: string, userId: string): Promise<IBooking> {
    const booking = await Booking.findById(id)
      .populate("listing guide tourist");

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Fixed: Use _id.toString() for populated objects, with null check
    if (!booking.tourist || !booking.guide || (booking.tourist._id.toString() !== userId && booking.guide._id.toString() !== userId)) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    return booking;
  }

  async getMyBookings(touristId: string): Promise<IBooking[]> {
    const bookings = await Booking.find({ tourist: touristId })
      .populate("listing guide")
      .sort({ createdAt: -1 });

    return bookings;
  }

  async getBookingsForGuide(guideId: string): Promise<IBooking[]> {
    const bookings = await Booking.find({ guide: guideId })
      .populate("listing tourist")
      .sort({ createdAt: -1 });

    return bookings;
  }

  // async updateBookingStatus(
  //   bookingId: string,
  //   guideId: string,
  //   status: BookingStatus
  // ): Promise<IBooking> {
  //   console.log("DEBUG: updateBookingStatus called with bookingId:", bookingId, "guideId:", guideId, "status:", status);  // Optional debug log
  //   const booking = await Booking.findById(bookingId);
    
  //   if (!booking) {
  //     throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  //   }

  //   // Fixed: Use _id.toString() for populated objects, with null check
  //   if (!booking.guide || booking.guide._id.toString() !== guideId) {
  //     throw new AppError(httpStatus.FORBIDDEN, "Only guide can update status");
  //   }

  //   if (booking.status !== BookingStatus.PENDING) {
  //     throw new AppError(httpStatus.BAD_REQUEST, "Can only update pending bookings");
  //   }

  //   booking.status = status;
  //   await booking.save();

  //   return booking.populate("listing guide tourist");
  // }

  // async cancelBooking(bookingId: string, userId: string): Promise<void> {
  //   const booking = await Booking.findById(bookingId);
    
  //   if (!booking) {
  //     throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  //   }

  //   // Fixed: Use _id.toString() for populated objects, with null check
  //   if (!booking.tourist || !booking.guide || (booking.tourist._id.toString() !== userId && booking.guide._id.toString() !== userId)) {
  //     throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  //   }

  //   if (booking.status === BookingStatus.CANCELLED) {
  //     throw new AppError(httpStatus.BAD_REQUEST, "Booking already cancelled");
  //   }

  //   booking.status = BookingStatus.CANCELLED;
  //   await booking.save();

  //   const listing = await Listing.findById(booking.listing);
  //   if (listing) {
  //     listing.availableDates.push(booking.date);
  //     await listing.save();
  //   }
  // }
async cancelBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    const isTourist = booking.tourist.toString() === userId;
    const isGuide = booking.guide.toString() === userId;
    if (!isTourist && !isGuide) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    // পেমেন্ট হয়ে গেলে সরাসরি ক্যান্সেল বন্ধ (নতুন লজিক)
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        "Paid bookings cannot be cancelled directly. Please contact support for refund."
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Booking already cancelled");
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    const listing = await Listing.findById(booking.listing);
    if (listing) {
      listing.availableDates.push(booking.date);
      await listing.save();
    }
  }

  async updateBookingStatus(
    bookingId: string,
    guideId: string,
    status: BookingStatus
  ): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.guide.toString() !== guideId) {
      throw new AppError(httpStatus.FORBIDDEN, "Only the assigned guide can update status");
    }

    // যদি অলরেডি পেইড হয়ে থাকে, তবে গাইড হুট করে ডিক্লাইন করতে পারবে না
    if (booking.paymentStatus === PaymentStatus.PAID && status === BookingStatus.DECLINED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Cannot decline a paid booking");
    }

    // পেমেন্ট কোডের সাথে মিল রেখে: স্ট্যাটাস পেন্ডিং থাকলেই কেবল চেঞ্জ করা যাবে
    if (booking.status !== BookingStatus.PENDING && booking.paymentStatus !== PaymentStatus.PAID) {
       // logic based on your previous controller
    }

    booking.status = status;
    await booking.save();

    return booking.populate("listing guide tourist");
  }
  async completeBooking(bookingId: string, guideId: string): Promise<IBooking> {
    console.log("DEBUG: completeBooking service called with bookingId:", bookingId, "guideId:", guideId);  // Optional debug log
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Fixed: Use _id.toString() for populated objects, with null check
    if (!booking.guide || booking.guide._id.toString() !== guideId) {
      throw new AppError(httpStatus.FORBIDDEN, "Only guide can complete");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Can only complete confirmed bookings");
    }

    booking.status = BookingStatus.COMPLETED;
    booking.paymentStatus = PaymentStatus.PAID;
    await booking.save();

    return booking.populate("listing guide tourist");
  }
}
 

 // Get all bookings for admin
const getAllBookingsForAdmin = async () => {
  // Get all bookings with populated data
  const bookings = await Booking.find()
    .populate({
      path: "tourist",
      select: "_id name email phone",
    })
    .populate({
      path: "guide",
      select: "_id name email phone",
    })
    .populate({
      path: "listing",
      select: "_id title price duration category",
    })
    .sort({ createdAt: -1 })
    .lean();

  // Calculate statistics
  const totalBookings = await Booking.countDocuments();
  const paidBookings = await Booking.countDocuments({ paymentStatus: "PAID" });
  const unpaidBookings = await Booking.countDocuments({ 
    paymentStatus: { $in: ["UNPAID", "PENDING"] } 
  });
  
  // Calculate total revenue from paid bookings
  const totalRevenueResult = await Booking.aggregate([
    { $match: { paymentStatus: "PAID" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);
  
  const totalRevenue = totalRevenueResult[0]?.total || 0;

  return {
    bookings,
    totalBookings,
    paidBookings,
    unpaidBookings,
    totalRevenue
  };
};

// Get booking statistics for admin dashboard
export const getBookingStatsForAdmin = async () => {
  // Booking status counts
  const pendingBookings = await Booking.countDocuments({ status: "PENDING" });
  const confirmedBookings = await Booking.countDocuments({ status: "CONFIRMED" });
  const completedBookings = await Booking.countDocuments({ status: "COMPLETED" });
  const cancelledBookings = await Booking.countDocuments({ status: "CANCELLED" });

  // Payment status counts
  const paidBookings = await Booking.countDocuments({ paymentStatus: "PAID" });
  const unpaidBookings = await Booking.countDocuments({ 
    paymentStatus: { $in: ["UNPAID", "PENDING"] } 
  });

  // Revenue calculations
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Monthly revenue
  const monthlyRevenueResult = await Booking.aggregate([
    { 
      $match: { 
        paymentStatus: "PAID",
        createdAt: { $gte: startOfMonth }
      } 
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);

  // Total revenue
  const totalRevenueResult = await Booking.aggregate([
    { $match: { paymentStatus: "PAID" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);

  // Today's bookings
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const todayBookings = await Booking.countDocuments({
    createdAt: { $gte: startOfDay }
  });

  return {
    bookingStatus: {
      PENDING: pendingBookings,
      CONFIRMED: confirmedBookings,
      COMPLETED: completedBookings,
      CANCELLED: cancelledBookings,
    },
    paymentStatus: {
      PAID: paidBookings,
      UNPAID: unpaidBookings,
    },
    totalRevenue: totalRevenueResult[0]?.total || 0,
    monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
    totalBookings: pendingBookings + confirmedBookings + completedBookings + cancelledBookings,
    todayBookings: todayBookings,
  };
};

// Get booking by ID for admin (with full details)
const getBookingByIdForAdmin = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate({
      path: "tourist",
      select: "_id name email phone profilePicture",
    })
    .populate({
      path: "guide",
      select: "_id name email phone profilePicture",
    })
    .populate({
      path: "listing",
      select: "_id title description price duration category images location",
    })
    .lean();

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};

// Update booking status
const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Update the status
  booking.status = status;
  await booking.save();

  // Return populated booking
  const updatedBooking = await Booking.findById(bookingId)
    .populate("tourist", "_id name email")
    .populate("guide", "_id name email")
    .populate("listing", "_id title");

  return updatedBooking;
};

// Update payment status
const updatePaymentStatus = async (bookingId: string, paymentStatus: PaymentStatus) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  booking.paymentStatus = paymentStatus;
  await booking.save();

  return booking;
};

export const BookingServices = {
  getAllBookingsForAdmin,
  getBookingStatsForAdmin,
  getBookingByIdForAdmin,
  updateBookingStatus,
  updatePaymentStatus,
};
 

// Get booking statistics (simple)
// export const getBookingStats = async () => {
//   const totalBookings = await Booking.countDocuments({});
//   const paidBookings = await Booking.countDocuments({ paymentStatus: "PAID" });
//   const pendingBookings = await Booking.countDocuments({ status: "PENDING" });

//   return {
//     totalBookings,
//     paidBookings,
//     pendingBookings,
//     unpaidBookings: totalBookings - paidBookings,
//   };
// };
export default new BookingService();