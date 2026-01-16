import { Review } from "./review.model";
import { Booking } from "../bookings/booking.model";
import { User } from "../users/user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";

const createReview = async (touristId: string, payload: any) => {
  const { bookingId, rating, comment } = payload;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  if (booking.tourist.toString() !== touristId || booking.status !== "COMPLETED") throw new AppError(httpStatus.FORBIDDEN, "Cannot review");

  const review = await Review.create({
    tourist: touristId,
    guide: booking.guide,
    booking: bookingId,
    rating,
    comment,
  });

  // Update guide rating
  const reviews = await Review.find({ guide: booking.guide });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await User.findByIdAndUpdate(booking.guide, { rating: avgRating });

  return review;
};

const getReviewsByGuide = async (guideId: string) => {
  return Review.find({ guide: guideId }).populate("tourist", "name").sort({ createdAt: -1 });
};

export const ReviewService = {
  createReview,
  getReviewsByGuide,
};