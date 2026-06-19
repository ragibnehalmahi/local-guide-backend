"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const user_service_1 = require("./user.service");
const AppError_1 = __importDefault(require("../../utils/AppError"));
// ==================== REGISTER USER ====================
const createUser = (0, catchAsync_1.default)(async (req, res) => {
    const user = await user_service_1.UserServices.createUser(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User registered successfully",
        data: user
    });
});
// ==================== GET MY PROFILE ====================
const getMyProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const user = await user_service_1.UserServices.getMyProfile(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Profile retrieved successfully",
        data: user
    });
});
// ==================== GET USER BY ID ====================
const getUserById = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const user = await user_service_1.UserServices.getUserById(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User retrieved successfully",
        data: user
    });
});
// ==================== UPDATE USER ====================
const updateUser = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = await user_service_1.UserServices.updateUser(userId, payload, verifiedToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User updated successfully",
        data: user
    });
});
const updateMyProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const verifiedToken = req.user;
    let payload = req.body;
    if (req.file) {
        payload.profilePicture = req.file.path;
    }
    // ✅ Convert comma-separated strings to arrays
    if (payload.languages && typeof payload.languages === "string") {
        payload.languages = payload.languages.split(",").map((s) => s.trim());
    }
    if (payload.expertise && typeof payload.expertise === "string") {
        payload.expertise = payload.expertise.split(",").map((s) => s.trim());
    }
    if (payload.travelPreferences && typeof payload.travelPreferences === "string") {
        payload.travelPreferences = payload.travelPreferences.split(",").map((s) => s.trim());
    }
    const user = await user_service_1.UserServices.updateUser(userId, payload, verifiedToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Profile updated successfully",
        data: user
    });
});
// ==================== GET ALL USERS (ADMIN) ====================
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserServices.getAllUsers(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Users retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});
// ==================== GET ALL GUIDES (PUBLIC) ====================
const getAllGuides = (0, catchAsync_1.default)(async (req, res) => {
    const guides = await user_service_1.UserServices.getAllGuides(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Guides fetched successfully",
        data: guides,
    });
});
// ==================== UPDATE USER STATUS (ADMIN) ====================
const updateUserStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedUser = await user_service_1.UserServices.updateUserStatus(id, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User status updated successfully",
        data: updatedUser
    });
});
// ==================== ADD TO WISHLIST ====================
const addToWishlist = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { tourId } = req.body;
    const wishlist = await user_service_1.UserServices.addToWishlist(userId, tourId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Added to wishlist successfully",
        data: { wishlist }
    });
});
// ==================== REMOVE FROM WISHLIST ====================
const removeFromWishlist = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { tourId } = req.params;
    const wishlist = await user_service_1.UserServices.removeFromWishlist(userId, tourId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Removed from wishlist successfully",
        data: { wishlist }
    });
});
const getWishlist = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const wishlistItems = await user_service_1.UserServices.getWishlistWithDetails(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Wishlist fetched successfully",
        data: wishlistItems,
    });
});
// ==================== SEARCH USER BY EMAIL ====================
const searchUserByEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email is required");
    }
    const user = await user_service_1.UserServices.searchUserByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User found",
        data: user
    });
});
// ==================== UPDATE USER ROLE (ADMIN) ====================
const updateUserRole = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const updatedUser = await user_service_1.UserServices.updateUserRole(id, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User role updated successfully",
        data: updatedUser
    });
});
exports.UserControllers = {
    createUser,
    getMyProfile,
    getUserById,
    updateUser,
    updateMyProfile,
    getAllUsers,
    getAllGuides,
    updateUserStatus,
    updateUserRole,
    addToWishlist,
    removeFromWishlist,
    searchUserByEmail, getWishlist
};
