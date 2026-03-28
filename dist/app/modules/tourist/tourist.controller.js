"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouristController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const tourist_service_1 = require("./tourist.service");
const getTouristDashboardStats = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const result = await tourist_service_1.TouristService.getTouristDashboardStats(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Stats retrieved successfully",
        data: result,
    });
});
exports.TouristController = {
    getTouristDashboardStats,
};
