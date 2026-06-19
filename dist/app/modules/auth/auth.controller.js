"use strict";
//local-guide-backend\src\app\modules\auth\auth.controller.ts 
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const userToken_1 = require("../../utils/userToken");
// ✅ Set cookies after login
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
    }
};
// ✅ Clear cookies after logout
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
};
// ✅ Login Controller
const credentialsLogin = (0, catchAsync_1.default)(async (req, res, next) => {
    console.log("🎯 Controller: req.body:", req.body);
    if (!req.body?.email || !req.body?.password) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email and password are required");
    }
    const loginInfo = await auth_service_1.AuthService.credentialsLogin(req.body);
    // Create tokens and set cookies
    const userTokens = (0, userToken_1.createUserTokens)(loginInfo.user);
    setAuthCookie(res, userTokens);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User Logged In Successfully",
        data: loginInfo,
    });
});
const refreshToken = (0, catchAsync_1.default)(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Refresh token not found in cookies or body!");
    }
    const result = await auth_service_1.AuthService.getNewAccessToken(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Access token retrieved successfully!",
        data: result,
    });
});
// ✅ Change Password Controller
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const authUser = req.user;
    const result = await auth_service_1.AuthService.changePassword(authUser._id, oldPassword, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Password reset successful",
        data: result,
    });
});
const logout = (0, catchAsync_1.default)(async (req, res, next) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User Logged Out Successfully",
        data: null,
    });
});
exports.AuthController = {
    credentialsLogin,
    refreshToken,
    changePassword,
    logout
};
