"use strict";
//local-guide-backend\src\app\modules\bookings\booking.service.ts             
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = exports.getBookingStatsForAdmin = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
const listing_model_1 = require("../listings/listing.model");
const user_model_1 = require("../users/user.model");
const AppError_1 = __importDefault(require("../../utils/AppError"));
class BookingService {
    async createBooking(payload, touristId) {
        const { listingId, date, guestCount } = payload;
        console.log("DEBUG: createBooking service called with listingId:", listingId, "touristId:", touristId); // Optional debug log
        const listing = await listing_model_1.Listing.findById(listingId);
        if (!listing || !listing.active) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found");
        }
        const tourist = await user_model_1.User.findById(touristId);
        if (!tourist || tourist.role !== "tourist") {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only tourists can book");
        }
        const isAvailable = listing.availableDates.some(d => d.toDateString() === date.toDateString());
        if (!isAvailable) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Date not available");
        }
        if (guestCount > listing.maxGroupSize) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Group size exceeds maximum");
        }
        const totalPrice = listing.price * guestCount;
        const booking = await booking_model_1.Booking.create({
            listing: listingId,
            guide: listing.guide,
            tourist: touristId,
            date,
            guestCount,
            totalPrice
        });
        listing.availableDates = listing.availableDates.filter(d => d.toDateString() !== date.toDateString());
        await listing.save();
        return booking.populate("listing guide tourist");
    }
    async getBookingById(id, userId) {
        const booking = await booking_model_1.Booking.findById(id)
            .populate("listing guide tourist");
        if (!booking) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        }
        if (!booking.tourist || !booking.guide || (booking.tourist._id.toString() !== userId && booking.guide._id.toString() !== userId)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized");
        }
        return booking;
    }
    async getMyBookings(touristId) {
        const bookings = await booking_model_1.Booking.find({ tourist: touristId })
            .populate("listing guide")
            .sort({ createdAt: -1 });
        return bookings;
    }
    async getBookingsForGuide(guideId) {
        const bookings = await booking_model_1.Booking.find({ guide: guideId })
            .populate("listing tourist")
            .sort({ createdAt: -1 });
        return bookings;
    }
    async cancelBooking(bookingId, userId) {
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        }
        const isTourist = booking.tourist.toString() === userId;
        const isGuide = booking.guide.toString() === userId;
        if (!isTourist && !isGuide) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized");
        }
        if (booking.paymentStatus === booking_interface_1.PaymentStatus.PAID) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Paid bookings cannot be cancelled directly. Please contact support for refund.");
        }
        if (booking.status === booking_interface_1.BookingStatus.CANCELLED) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Booking already cancelled");
        }
        booking.status = booking_interface_1.BookingStatus.CANCELLED;
        await booking.save();
        const listing = await listing_model_1.Listing.findById(booking.listing);
        if (listing) {
            listing.availableDates.push(booking.date);
            await listing.save();
        }
    }
    async updateBookingStatus(bookingId, guideId, status) {
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        }
        if (booking.guide.toString() !== guideId) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only the assigned guide can update status");
        }
        if (booking.paymentStatus === booking_interface_1.PaymentStatus.PAID && status === booking_interface_1.BookingStatus.DECLINED) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot decline a paid booking");
        }
        if (booking.status !== booking_interface_1.BookingStatus.PENDING && booking.paymentStatus !== booking_interface_1.PaymentStatus.PAID) {
        }
        booking.status = status;
        await booking.save();
        return booking.populate("listing guide tourist");
    }
    async completeBooking(bookingId, guideId) {
        console.log("DEBUG: completeBooking service called with bookingId:", bookingId, "guideId:", guideId); // Optional debug log
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
        }
        if (!booking.guide || booking.guide._id.toString() !== guideId) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only guide can complete");
        }
        if (booking.status !== booking_interface_1.BookingStatus.CONFIRMED) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Can only complete confirmed bookings");
        }
        booking.status = booking_interface_1.BookingStatus.COMPLETED;
        booking.paymentStatus = booking_interface_1.PaymentStatus.PAID;
        await booking.save();
        return booking.populate("listing guide tourist");
    }
}
const getAllBookingsForAdmin = async () => {
    const bookings = await booking_model_1.Booking.find()
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
    const totalBookings = await booking_model_1.Booking.countDocuments();
    const paidBookings = await booking_model_1.Booking.countDocuments({ paymentStatus: "PAID" });
    const unpaidBookings = await booking_model_1.Booking.countDocuments({
        paymentStatus: { $in: ["UNPAID", "PENDING"] }
    });
    const totalRevenueResult = await booking_model_1.Booking.aggregate([
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
const getBookingStatsForAdmin = async () => {
    const pendingBookings = await booking_model_1.Booking.countDocuments({ status: "PENDING" });
    const confirmedBookings = await booking_model_1.Booking.countDocuments({ status: "CONFIRMED" });
    const completedBookings = await booking_model_1.Booking.countDocuments({ status: "COMPLETED" });
    const cancelledBookings = await booking_model_1.Booking.countDocuments({ status: "CANCELLED" });
    const paidBookings = await booking_model_1.Booking.countDocuments({ paymentStatus: "PAID" });
    const unpaidBookings = await booking_model_1.Booking.countDocuments({
        paymentStatus: { $in: ["UNPAID", "PENDING"] }
    });
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyRevenueResult = await booking_model_1.Booking.aggregate([
        {
            $match: {
                paymentStatus: "PAID",
                createdAt: { $gte: startOfMonth }
            }
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    // Total revenue
    const totalRevenueResult = await booking_model_1.Booking.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    // Today's bookings
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayBookings = await booking_model_1.Booking.countDocuments({
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
exports.getBookingStatsForAdmin = getBookingStatsForAdmin;
// Get booking by ID for admin (with full details)
const getBookingByIdForAdmin = async (bookingId) => {
    const booking = await booking_model_1.Booking.findById(bookingId)
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return booking;
};
// Update booking status
const updateBookingStatus = async (bookingId, status) => {
    const booking = await booking_model_1.Booking.findById(bookingId);
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    // Update the status
    booking.status = status;
    await booking.save();
    // Return populated booking
    const updatedBooking = await booking_model_1.Booking.findById(bookingId)
        .populate("tourist", "_id name email")
        .populate("guide", "_id name email")
        .populate("listing", "_id title");
    return updatedBooking;
};
// Update payment status
const updatePaymentStatus = async (bookingId, paymentStatus) => {
    const booking = await booking_model_1.Booking.findById(bookingId);
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    booking.paymentStatus = paymentStatus;
    await booking.save();
    return booking;
};
exports.BookingServices = {
    getAllBookingsForAdmin,
    getBookingStatsForAdmin: exports.getBookingStatsForAdmin,
    getBookingByIdForAdmin,
    updateBookingStatus,
    updatePaymentStatus,
};
exports.default = new BookingService();
