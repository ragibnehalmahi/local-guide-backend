import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
import validateRequest from "../../middlewares/validateRequest";
import {
  getEarningsStats,
  getEarningsHistory,
  getEarningsChartData,
} from "./earnings.controller";
import { guideEarningsValidation } from "./earnings.validation";

const router = Router();

router.use(authGuard(UserRole.GUIDE)); // Only authenticated guides

router.get("/stats", getEarningsStats);
router.get("/history", validateRequest(guideEarningsValidation.getHistory), getEarningsHistory);
router.get("/chart", getEarningsChartData);

export default router;