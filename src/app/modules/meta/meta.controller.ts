import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { MetaService } from "./meta.service";
 

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const role = (req as any).user.role;
  const result = await MetaService.getDashboardStats(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard stats fetched",
    data: result,
  });
});

export const MetaController = {
  getDashboardStats,
};