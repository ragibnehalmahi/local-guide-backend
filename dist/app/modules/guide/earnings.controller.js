"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEarningsChartData = exports.getEarningsHistory = exports.getEarningsStats = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const earnings_service_1 = __importDefault(require("./earnings.service"));
const AppError_1 = __importDefault(require("../../utils/AppError"));
exports.getEarningsStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const guideId = req.user._id.toString();
    const result = await earnings_service_1.default.getEarningsStats(guideId);
    res.status(200).json(result);
});
exports.getEarningsHistory = (0, catchAsync_1.default)(async (req, res, next) => {
    const guideId = req.user._id.toString();
    const filters = req.query;
    const { page = "1", limit = "10" } = req.query;
    const result = await earnings_service_1.default.getEarningsHistory(guideId, filters, parseInt(page), parseInt(limit));
    res.status(200).json(result);
});
exports.getEarningsChartData = (0, catchAsync_1.default)(async (req, res, next) => {
    const guideId = req.user._id.toString();
    const { period = "month" } = req.query;
    const periodStr = String(period);
    if (!["month", "year"].includes(periodStr)) {
        return next(new AppError_1.default(400, "Invalid period. Use 'month' or 'year'"));
    }
    const result = await earnings_service_1.default.getEarningsChartData(guideId, periodStr);
    res.status(200).json(result);
});
