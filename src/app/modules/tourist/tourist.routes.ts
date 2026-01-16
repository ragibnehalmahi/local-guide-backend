// backend/src/modules/tourist/tourist.routes.ts
import express from "express";
import { TouristController } from "./tourist.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";

const router = express.Router();

// Protected routes (Tourist only)
router.use(authGuard(UserRole.TOURIST));

// Dashboard statistics
router.get("/dashboard/stats", TouristController.getTouristDashboardStats);

export const TouristRoutes = router;