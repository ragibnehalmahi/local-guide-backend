import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;
  const result = await ReviewService.createReview(touristId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted",
    data: result,
  });
});

const getReviewsForGuide = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewsByGuide(req.params.guideId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews fetched",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;
  const result = await ReviewService.getMyReviews(touristId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My reviews fetched successfully",
    data: result,
  });
});

// ✅ New: Get completed bookings for review
const getCompletedBookings = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;
  const result = await ReviewService.getCompletedBookingsForReview(touristId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Completed bookings fetched successfully",
    data: result,
  });
});

// ✅ New: Update review (Admin only)
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const result = await ReviewService.updateReview(reviewId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

// ✅ New: Delete review (Admin only)
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  await ReviewService.deleteReview(reviewId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getReviewsForGuide,
  getMyReviews,
  getCompletedBookings,
  updateReview,
  deleteReview,
};