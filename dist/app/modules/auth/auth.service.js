"use strict";
// src/app/modules/auth/auth.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const user_model_1 = require("../users/user.model");
const user_interface_1 = require("../users/user.interface");
// Helper: JWT generator
const generateToken = (payload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
// ------------------ LOGIN FUNCTION ------------------
const credentialsLogin = async (payload) => {
    console.log("🔑 Service: Received payload:", payload);
    // Robust check for valid payload object
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid request payload. Ensure email and password are provided in JSON body.");
    }
    if (!payload.email || !payload.password) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email and password are required.");
    }
    // Safely access email and password
    const { email, password } = payload;
    // 1. Find user and explicitly select the password field
    // We are removing .lean() here, as .toObject() is used later to remove the password.
    const existingUser = await user_model_1.User.findOne({ email }).select("+password");
    if (!existingUser) {
        // Security best practice: use a generic error message
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid email or password");
    }
    // Check user status (Re-added for security based on previous discussion)
    if (existingUser.status !== user_interface_1.UserStatus.ACTIVE) {
        console.log(`❌ Account not active: ${existingUser.status}`);
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${existingUser.status}. Please contact administrator.`);
    }
    if (!existingUser.password) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "User password not found");
    }
    // Password comparison
    const isPasswordMatched = await bcryptjs_1.default.compare(password.trim(), // FIX: Add .trim() for comparison safety and robustness
    existingUser.password);
    if (!isPasswordMatched) {
        // Security best practice: use a generic error message
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid email or password");
    }
    console.log(`🎉 Login successful for: ${email}`);
    const jwtPayload = {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
    };
    // FIX: Re-adding critical environment variable checks before token generation
    // This is crucial for preventing 'invalid signature' errors caused by missing secrets.
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        console.error("❌ JWT secrets not configured");
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Server configuration error: JWT secrets missing.");
    }
    const accessToken = generateToken(jwtPayload, process.env.JWT_ACCESS_SECRET, (process.env.JWT_ACCESS_EXPIRES || "1h") // Use value from .env, default to '1h'
    );
    const refreshToken = generateToken(jwtPayload, process.env.JWT_REFRESH_SECRET, (process.env.JWT_REFRESH_EXPIRES || "7d") // Use value from .env, default to '7d'
    );
    // Use toObject() to ensure password field is removed from the response
    const { password: pass, ...rest } = existingUser.toObject();
    return {
        accessToken,
        refreshToken,
        user: rest,
    };
};
// ------------------ REFRESH TOKEN FUNCTION ------------------
const getNewAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Refresh token is required");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await user_model_1.User.findById(decoded.userId).select("+status +role +email");
        if (!user)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        if (user.status === user_interface_1.UserStatus.BLOCKED ||
            user.status === user_interface_1.UserStatus.DELETED ||
            user.status === user_interface_1.UserStatus.INACTIVE) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User is blocked, deleted or inactive");
        }
        const newAccessToken = generateToken({
            userId: user._id,
            email: user.email,
            role: user.role,
        }, 
        // process.env.JWT_ACCESS_SECRET as string,
        process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES || "1h");
        return {
            user,
            accessToken: newAccessToken,
            refreshToken,
        };
    }
    catch (err) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid refresh token");
    }
};
// ------------------ PASSWORD CHANGE FUNCTION ------------------
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await user_model_1.User.findById(userId).select("+password");
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    if (user.status === user_interface_1.UserStatus.BLOCKED ||
        user.status === user_interface_1.UserStatus.DELETED ||
        user.status === user_interface_1.UserStatus.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User is blocked, deleted or inactive");
    }
    const isOldPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordValid)
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old password incorrect");
    const isSame = await bcryptjs_1.default.compare(newPassword, user.password);
    if (isSame)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "New password cannot be same as old");
    user.password = await bcryptjs_1.default.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
    await user.save();
    return { message: "Password reset successful" };
};
// ------------------ TOKEN MODEL ------------------
const tokenSchema = new mongoose_1.Schema({
    token: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
const TokenModel = (0, mongoose_1.model)("Token", tokenSchema);
// ------------------ UPDATED LOGOUT FUNCTION ------------------
// const logout = async (refreshToken: string) => {
//   if (!refreshToken) {
//     throw new AppError("No refresh token provided", httpStatus.BAD_REQUEST);
//   }
//   // ✅ Remove the token from DB
//   const deleted = await TokenModel.findOneAndDelete({ token: refreshToken });
//   if (!deleted) {
//     throw new AppError("Invalid or already expired token", httpStatus.NOT_FOUND);
//   }
//   console.log("✅ Token removed successfully from DB");
//   return { message: "Logout successful" };
// };
// ------------------ EXPORT ------------------
exports.AuthService = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    // logout,
};
