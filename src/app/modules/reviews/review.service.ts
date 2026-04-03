// src/app/modules/reviews/review.service.ts
import { Review } from "./review.model";
import { Booking } from "../bookings/booking.model";
import { User } from "../users/user.model";
import { Listing } from "../listings/listing.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";

const createReview = async (touristId: string, payload: any) => {
  const { bookingId, rating, comment } = payload;
  const booking = await Booking.findById(bookingId);
  
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  if (booking.tourist.toString() !== touristId) throw new AppError(httpStatus.FORBIDDEN, "Not your booking");
  if (booking.status !== "COMPLETED") throw new AppError(httpStatus.FORBIDDEN, "Cannot review - tour not completed");

  // Check if review already exists
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) throw new AppError(httpStatus.BAD_REQUEST, "Review already submitted");

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
  return Review.find({ guide: guideId })
    .populate("tourist", "name profilePicture")
    .sort({ createdAt: -1 });
};

const getMyReviews = async (touristId: string) => {
  return Review.find({ tourist: touristId })
    .populate({
      path: "booking",
      populate: {
        path: "listing",
        select: "title"
      }
    })
    .populate("guide", "name profilePicture")
    .sort({ createdAt: -1 });
};

 
const getCompletedBookings = async (touristId: string) => {
  // Get all completed bookings
  const completedBookings = await Booking.find({
    tourist: touristId,
    status: "COMPLETED"
  }).populate({
    path: "listing",
    select: "title images price"
  }).populate({
    path: "guide",
    select: "name profilePicture"
  });

  // Get bookings that already have reviews
  const reviewedBookings = await Review.find({ tourist: touristId }).select("booking");

  const reviewedBookingIds = reviewedBookings.map(r => r.booking.toString());

  // Filter out bookings that already have reviews
  const pendingReviews = completedBookings.filter(
    booking => !reviewedBookingIds.includes(booking._id.toString())
  );

  return pendingReviews;
};

export const ReviewService = {
  createReview,
  getReviewsByGuide,
  getMyReviews,
  getCompletedBookings, 
};


// import { Review } from  "./review.model";
// import { Booking } from "../bookings/booking.model";
// import { User } from "../users/user.model";
// import AppError from "../../utils/AppError";
// import httpStatus from "http-status-codes";

// const createReview = async (touristId: string, payload: any) => {
//   const { bookingId, rating, comment } = payload;
//   const booking = await Booking.findById(bookingId);
//   if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
//   if (booking.tourist.toString() !== touristId || booking.status !== "COMPLETED") throw new AppError(httpStatus.FORBIDDEN, "Cannot review");

//   const review = await Review.create({
//     tourist: touristId,
//     guide: booking.guide,
//     booking: bookingId,
//     rating,
//     comment,
//   });

//   // Update guide rating
//   const reviews = await Review.find({ guide: booking.guide });
//   const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
//   await User.findByIdAndUpdate(booking.guide, { rating: avgRating });

//   return review;
// };

// const getReviewsByGuide = async (guideId: string) => {
//   return Review.find({ guide: guideId }).populate("tourist", "name").sort({ createdAt: -1 });
// };

// const getMyReviews = async (touristId: string) => {
//   return Review.find({ tourist: touristId })
//     .populate({
//       path: "booking",
//       populate: {
//          path: "listing",
//          select: "title"
//       }
//     })
//     .populate("guide", "name avatar")
//     .sort({ createdAt: -1 });
// };

// export const ReviewService = {
//   createReview,
//   getReviewsByGuide,
//   getMyReviews,
// };
