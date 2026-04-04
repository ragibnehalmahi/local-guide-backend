import { Review } from  "./review.model";
import { Booking } from "../bookings/booking.model";
import { User } from "../users/user.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status-codes";

const createReview = async (touristId: string, payload: any) => {
  const { bookingId, rating, comment } = payload;
  
  // Check if booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }
  
  // Verify ownership
  if (booking.tourist.toString() !== touristId) {
    throw new AppError(httpStatus.FORBIDDEN, "Not your booking");
  }
  
  // Verify booking is completed
  if (booking.status !== "COMPLETED") {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot review - tour not completed");
  }
  
  // Check if review already exists
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) {
    throw new AppError(httpStatus.BAD_REQUEST, "Review already submitted for this booking");
  }

  // Create review
  const review = await Review.create({
    tourist: touristId,
    guide: booking.guide,
    booking: bookingId,
    rating,
    comment,
  });

  // Update guide's average rating safely
  try {
    const reviews = await Review.find({ guide: booking.guide });
    const reviewsCount = reviews.length;
    
    if (reviewsCount > 0) {
      // Calculate average with safety check for r.rating being undefined/null
      const totalRatingSum = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
      const rawAvgRating = totalRatingSum / reviewsCount;
      
      // Force to 1 decimal place (e.g. 4.8)
      const avgRating = parseFloat(rawAvgRating.toFixed(1));
      
      console.log(`[Review Service] Updating Guide ${booking.guide}: Count=${reviewsCount}, New Rating=${avgRating}`);
      
      // Update both rating AND totalReviews count for consistency
      const guideId = (booking.guide as any)._id || booking.guide;
      await User.findByIdAndUpdate(guideId, { 
        rating: avgRating,
        totalReviews: reviewsCount
      });
    }
  } catch (updateError) {
    console.error("[Review Service] Non-critical error updating guide stats:", updateError);
    // We don't throw here to avoid failing a successful review creation if JUST the stats update fails
  }

  return review;
}

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

// ✅ New: Get completed bookings for review
const getCompletedBookingsForReview = async (touristId: string) => {
  // Get all completed bookings
  const completedBookings = await Booking.find({
    tourist: touristId,
    status: "COMPLETED"
  }).populate({
    path: "listing",
    select: "title images price location"
  }).populate({
    path: "guide",
    select: "name profilePicture"
  });

  // Get already reviewed bookings
  const reviewedBookings = await Review.find({ tourist: touristId }).select("booking");
  const reviewedBookingIds = reviewedBookings.map(r => r.booking.toString());

  // Filter out already reviewed bookings
  const pendingReviews = completedBookings.filter(
    booking => !reviewedBookingIds.includes(booking._id.toString())
  );

  return pendingReviews;
};

// ✅ New: Update review
const updateReview = async (reviewId: string, payload: any) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { rating: payload.rating, comment: payload.comment },
    { new: true, runValidators: true }
  );

  // Recalculate guide rating
  const reviews = await Review.find({ guide: review.guide });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await User.findByIdAndUpdate(review.guide, { rating: avgRating });

  return updatedReview;
};

// ✅ New: Delete review
const deleteReview = async (reviewId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  await Review.findByIdAndDelete(reviewId);

  // Recalculate guide rating
  const reviews = await Review.find({ guide: review.guide });
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
  await User.findByIdAndUpdate(review.guide, { rating: avgRating });

  return null;
};

export const ReviewService = {
  createReview,
  getReviewsByGuide,
  getMyReviews,
  getCompletedBookingsForReview,
  updateReview,
  deleteReview,
};