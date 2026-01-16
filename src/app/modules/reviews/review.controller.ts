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

export const ReviewController = {
  createReview,
  getReviewsForGuide,
};