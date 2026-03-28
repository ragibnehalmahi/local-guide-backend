import { Request, Response, NextFunction } from "express";
import catchAsync from "../../utils/catchAsync";
import GuideEarningsService from "./earnings.service";
import { authGuard, AuthenticatedRequest } from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { guideEarningsValidation } from "./earnings.validation";
import AppError from "../../utils/AppError";

export const getEarningsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const guideId = (req as AuthenticatedRequest).user!._id.toString();
    
    const result = await GuideEarningsService.getEarningsStats(guideId);
    res.status(200).json(result);
  }
);

export const getEarningsHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const guideId = (req as AuthenticatedRequest).user!._id.toString();
    const filters = req.query as any;
    const { page = "1", limit = "10" } = req.query;

    const result = await GuideEarningsService.getEarningsHistory(
      guideId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json(result);
  }
);

export const getEarningsChartData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const guideId = (req as AuthenticatedRequest).user!._id.toString();
    const { period = "month" } = req.query;
    const periodStr = String(period);

    if (!["month", "year"].includes(periodStr)) {
      return next(new AppError(400, "Invalid period. Use 'month' or 'year'"));
    }

    const result = await GuideEarningsService.getEarningsChartData(guideId, periodStr as "month" | "year");
    res.status(200).json(result);
  }
);