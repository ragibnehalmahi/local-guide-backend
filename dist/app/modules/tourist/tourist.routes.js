"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouristRoutes = void 0;
// backend/src/modules/tourist/tourist.routes.ts
const express_1 = __importDefault(require("express"));
const tourist_controller_1 = require("./tourist.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router();
// Protected routes (Tourist only)
router.use((0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST));
// Dashboard statistics
router.get("/dashboard/stats", tourist_controller_1.TouristController.getTouristDashboardStats);
exports.TouristRoutes = router;
