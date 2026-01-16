// backend/src/modules/tourist/tourist.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TouristService } from "./tourist.service";  

const getTouristDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await TouristService.getTouristDashboardStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stats retrieved successfully",
    data: result,
  });
});

export const TouristController = {
  getTouristDashboardStats,
};