"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const meta_service_1 = require("./meta.service");
const getDashboardStats = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const role = req.user.role;
    const result = await meta_service_1.MetaService.getDashboardStats(userId, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Dashboard stats fetched",
        data: result,
    });
});
exports.MetaController = {
    getDashboardStats,
};
