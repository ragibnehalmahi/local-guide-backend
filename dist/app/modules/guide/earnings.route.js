"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const earnings_controller_1 = require("./earnings.controller");
const earnings_validation_1 = require("./earnings.validation");
const router = (0, express_1.Router)();
router.use((0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE)); // Only authenticated guides
router.get("/stats", earnings_controller_1.getEarningsStats);
router.get("/history", (0, validateRequest_1.default)(earnings_validation_1.guideEarningsValidation.getHistory), earnings_controller_1.getEarningsHistory);
router.get("/chart", earnings_controller_1.getEarningsChartData);
exports.default = router;
