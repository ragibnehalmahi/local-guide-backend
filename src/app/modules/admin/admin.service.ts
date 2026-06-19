// backend/src/modules/admin/admin.service.ts
import { Types } from "mongoose";
// import { User, UserRole, UserStatus } from "../users/user.model";
import { Listing } from "../listings/listing.model";
import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
import { Review } from "../reviews/review.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";
import { User } from "../users/user.model";
import { UserRole, UserStatus } from "../users/user.interface";

export class AdminService {
  // ============ USER MANAGEMENT ============
  static async getAllUsers(query: any) {
    const { search, role, status, page = 1, limit = 10 } = query;
    const filter: any = { isDeleted: false };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const data = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    return {
      data,
      meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  static async searchUserByEmail(email: string) {
    if (!email) throw new AppError(httpStatus.BAD_REQUEST, "Email required");
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: "i" } }).select("-password");
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    return user;
  }

  static async updateUserStatus(userId: string, status: UserStatus) {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (!Object.values(UserStatus).includes(status)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid status");
    user.status = status;
    await user.save();
    return user;
  }

  static async updateUserRole(userId: string, role: UserRole) {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (!Object.values(UserRole).includes(role)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
    if (user.role === UserRole.SUPER_ADMIN) throw new AppError(httpStatus.FORBIDDEN, "Cannot change Super Admin role");
    user.role = role;
    await user.save();
    return user;
  }

  static async deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (user.role === UserRole.SUPER_ADMIN) throw new AppError(httpStatus.FORBIDDEN, "Cannot delete Super Admin");
    // Optional: delete all related listings and bookings
    await User.findByIdAndDelete(userId);
    // Cascade (optional)
    await Listing.deleteMany({ guide: userId });
    await Booking.deleteMany({ $or: [{ tourist: userId }, { guide: userId }] });
    await Review.deleteMany({ $or: [{ tourist: userId }, { guide: userId }] });
  }

  // ============ LISTING MANAGEMENT ============
  static async getAllListings(query: any) {
    const { search, category, city, status, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (status === "active") filter.active = true;
    if (status === "inactive") filter.active = false;

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Listing.find(filter)
      .populate("guide", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Listing.countDocuments(filter);
    return { data, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
  }

  static async updateListing(listingId: string, payload: any) {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    const updated = await Listing.findByIdAndUpdate(listingId, payload, { new: true, runValidators: true });
    return updated;
  }

  static async deleteListing(listingId: string) {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    await Listing.findByIdAndDelete(listingId);
    // Optionally delete related bookings
    await Booking.deleteMany({ listing: listingId });
  }

  // ============ BOOKING MANAGEMENT ============
  static async getAllBookings(query: any) {
    const { status, paymentStatus, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Booking.find(filter)
      .populate("tourist", "name email")
      .populate("guide", "name email")
      .populate("listing", "title price")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Booking.countDocuments(filter);
    return { data, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
  }

  static async getBookingStats() {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: BookingStatus.PENDING });
    const confirmed = await Booking.countDocuments({ status: BookingStatus.CONFIRMED });
    const completed = await Booking.countDocuments({ status: BookingStatus.COMPLETED });
    const cancelled = await Booking.countDocuments({ status: BookingStatus.CANCELLED });
    const paid = await Booking.countDocuments({ paymentStatus: PaymentStatus.PAID });
    const unpaid = await Booking.countDocuments({ paymentStatus: { $in: ["PENDING", "FAILED"] } });
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    return { total, pending, confirmed, completed, cancelled, paid, unpaid, totalRevenue };
  }

  static async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    if (!Object.values(BookingStatus).includes(status)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid status");
    booking.status = status;
    await booking.save();
    return booking.populate(["tourist", "guide", "listing"]);
  }

  static async updatePaymentStatus(bookingId: string, paymentStatus: PaymentStatus) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    if (!Object.values(PaymentStatus).includes(paymentStatus)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment status");
    booking.paymentStatus = paymentStatus;
    await booking.save();
    return booking;
  }

  // ============ REVIEW MANAGEMENT ============
  static async getAllReviews(query: any) {
    const { rating, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (rating) filter.rating = Number(rating);
    const skip = (Number(page) - 1) * Number(limit);
    const data = await Review.find(filter)
      .populate("tourist", "name email")
      .populate("guide", "name email")
      .populate("booking", "_id")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Review.countDocuments(filter);
    return { data, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
  }

  static async updateReview(reviewId: string, payload: { rating?: number; comment?: string }) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    const updated = await Review.findByIdAndUpdate(reviewId, payload, { new: true, runValidators: true });

    const guideReviews = await Review.find({ guide: review.guide });
    const avgRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length;
    await User.findByIdAndUpdate(review.guide, { rating: parseFloat(avgRating.toFixed(1)) });
    return updated;
  }

  static async deleteReview(reviewId: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    await Review.findByIdAndDelete(reviewId);

    const guideReviews = await Review.find({ guide: review.guide });
    const avgRating = guideReviews.length ? guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length : 0;
    await User.findByIdAndUpdate(review.guide, { rating: parseFloat(avgRating.toFixed(1)) });
  }
}