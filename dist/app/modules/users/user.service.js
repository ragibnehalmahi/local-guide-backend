"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const user_interface_1 = require("./user.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = __importDefault(require("../../utils/AppError"));
const user_model_1 = require("./user.model");
const listing_model_1 = require("../listings/listing.model");
const config_1 = __importDefault(require("../../config/config"));
/**
 * Create a new user (Registration)
 */
const createUser = async (payload) => {
    const { email, password, role = user_interface_1.UserRole.TOURIST, ...rest } = payload;
    if (!email || !password) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email and password are required");
    }
    const isUserExist = await user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = await user_model_1.User.create({
        ...rest,
        email,
        password: hashedPassword,
        role,
    });
    return newUser;
};
/**
 * Update user profile
 */
const updateUser = async (userId, payload, decodedToken) => {
    if (decodedToken.role === user_interface_1.UserRole.TOURIST || decodedToken.role === user_interface_1.UserRole.GUIDE) {
        if (userId !== decodedToken._id) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "You are not authorized to update this profile");
        }
    }
    const ifUserExist = await user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (decodedToken.role === user_interface_1.UserRole.ADMIN && ifUserExist.role === user_interface_1.UserRole.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Admins cannot modify Super Admin profiles");
    }
    if (payload.email) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email address cannot be updated directly");
    }
    if (payload.role) {
        if (decodedToken.role !== user_interface_1.UserRole.ADMIN && decodedToken.role !== user_interface_1.UserRole.SUPER_ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only admins can update role");
        }
        if (payload.role === user_interface_1.UserRole.SUPER_ADMIN && decodedToken.role !== user_interface_1.UserRole.SUPER_ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only Super Admin can create another Super Admin");
        }
    }
    const sensitiveFields = ['status', 'isDeleted', 'isVerified'];
    const isUpdatingSensitiveField = sensitiveFields.some(field => field in payload);
    if (isUpdatingSensitiveField) {
        if (decodedToken.role !== user_interface_1.UserRole.ADMIN && decodedToken.role !== user_interface_1.UserRole.SUPER_ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only admins can update status, isDeleted, or isVerified fields");
        }
    }
    if (payload.password) {
        payload.password = await bcryptjs_1.default.hash(payload.password, config_1.default.bcrypt_salt_rounds);
    }
    const newUpdatedUser = await user_model_1.User.findByIdAndUpdate(userId, { $set: payload }, { new: true, runValidators: true }).select("-password");
    return newUpdatedUser;
};
/**
 * Get my profile
 */
const getMyProfile = async (userId) => {
    const user = await user_model_1.User.findById(userId).select("-password");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.status !== user_interface_1.UserStatus.ACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User account is not active");
    }
    return user;
};
/**
 * Get all users (Admin only)
 */
const getAllUsers = async (query) => {
    const { search, role, status, page = 1, limit = 10 } = query;
    const filter = { isDeleted: false };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }
    if (role)
        filter.role = role;
    if (status)
        filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const users = await user_model_1.User.find(filter)
        .select("-password")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    const total = await user_model_1.User.countDocuments(filter);
    return {
        data: users,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
        },
    };
};
/**
 * Get all guides (Public)
 */
const getAllGuides = async (query) => {
    const { city, expertise, minRating, maxPrice, language, search } = query;
    const filter = {
        role: user_interface_1.UserRole.GUIDE,
        status: user_interface_1.UserStatus.ACTIVE,
        isVerified: true
    };
    if (city && filter.location) {
        filter['location.city'] = { $regex: city, $options: "i" };
    }
    if (expertise) {
        filter.expertise = { $in: expertise.split(",") };
    }
    if (minRating) {
        filter.rating = { $gte: Number(minRating) };
    }
    if (maxPrice) {
        filter.dailyRate = { $lte: Number(maxPrice) };
    }
    if (language) {
        filter.languages = { $in: [language] };
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { bio: { $regex: search, $options: "i" } }
        ];
    }
    const guides = await user_model_1.User.find(filter)
        .select("-password -wishlist -travelPreferences -authProviders")
        .sort({ rating: -1, totalReviews: -1 });
    return guides;
};
/**
 * Search user by email
 */
const searchUserByEmail = async (email) => {
    if (!email) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email is required");
    }
    const user = await user_model_1.User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") }
    }).select("-password");
    return user;
};
/**
 * Update user status (Admin only)
 */
const updateUserStatus = async (userId, status) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (!Object.values(user_interface_1.UserStatus).includes(status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid status value");
    }
    user.status = status;
    await user.save();
    return user;
};
/**
 * Get all listings with filtering
 */
const getAllListingsFromDB = async (query) => {
    const queryObj = { ...query };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    let searchTerm = '';
    if (query?.searchTerm) {
        searchTerm = query.searchTerm;
    }
    const searchableFields = ['title', 'location.city', 'category'];
    const searchQuery = listing_model_1.Listing.find({
        $or: searchableFields.map((field) => ({
            [field]: { $regex: searchTerm, $options: 'i' },
        })),
    }).find(queryObj);
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;
    const data = await searchQuery
        .sort(query?.sort || '-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('guide', 'name email');
    const total = await listing_model_1.Listing.countDocuments();
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data,
    };
};
/**
 * Add to wishlist (Tourist only)
 */
const addToWishlist = async (userId, tourId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.role !== user_interface_1.UserRole.TOURIST) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only tourists can add to wishlist");
    }
    if (user.wishlist?.includes(tourId)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Tour already in wishlist");
    }
    user.wishlist = [...(user.wishlist || []), tourId];
    await user.save();
    return user.wishlist;
};
/**
 * Remove from wishlist
 */
const removeFromWishlist = async (userId, tourId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    user.wishlist = user.wishlist?.filter(id => id.toString() !== tourId) || [];
    await user.save();
    return user.wishlist;
};
/**
 * Get user by ID
 */
const getUserById = async (userId) => {
    const user = await user_model_1.User.findById(userId).select("-password");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
exports.UserServices = {
    createUser,
    updateUser,
    getMyProfile,
    getAllUsers,
    getAllGuides,
    searchUserByEmail,
    updateUserStatus,
    addToWishlist,
    removeFromWishlist,
    getUserById,
    getAllListingsFromDB
};
