import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { guideRoleCheck } from "@/middleware/role.middleware";
import { validateRequest } from "@/middleware/validation.middleware";
import {
  getEarningsStats,
  getEarningsHistory,
  getEarningsChartData,
} from "@/controllers/guide/earnings.controller";
import { guideEarningsValidation } from "@/validations/guide/earnings.validation";

const router = Router();

router.use(authMiddleware, guideRoleCheck); // Only authenticated guides

router.get("/stats", getEarningsStats);
router.get("/history", validateRequest(guideEarningsValidation.getHistory), getEarningsHistory);
router.get("/chart", getEarningsChartData);

export default router;