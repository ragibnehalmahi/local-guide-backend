import { UserRole, UserStatus } from './user.interface';
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import AppError from "../../utils/AppError";  
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { Listing } from "../listings/listing.model";
import { JwtPayload } from "jsonwebtoken";
import config from '../../config/config';

/**
 * Create a new user (Registration)
 */
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, role = UserRole.TOURIST, ...rest } = payload;

  if (!email || !password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password as string, 10);

  const newUser = await User.create({
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
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  if (decodedToken.role === UserRole.TOURIST || decodedToken.role === UserRole.GUIDE) {
    if (userId !== decodedToken._id) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update this profile");
    }
  }

  const ifUserExist = await User.findById(userId);
  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (decodedToken.role === UserRole.ADMIN && ifUserExist.role === UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Admins cannot modify Super Admin profiles");
  }

  if (payload.email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email address cannot be updated directly");
  }

  if (payload.role) {
    if (decodedToken.role !== UserRole.ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Only admins can update role");
    }
    if (payload.role === UserRole.SUPER_ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can create another Super Admin");
    }
  }

  const sensitiveFields = ['status', 'isDeleted', 'isVerified'];
  const isUpdatingSensitiveField = sensitiveFields.some(field => field in payload);

  if (isUpdatingSensitiveField) {
    if (decodedToken.role !== UserRole.ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Only admins can update status, isDeleted, or isVerified fields");
    }
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);
  }

  const newUpdatedUser = await User.findByIdAndUpdate(
    userId, 
    { $set: payload },
    { new: true, runValidators: true }
  ).select("-password");

  return newUpdatedUser;
};

/**
 * Get my profile
 */
const getMyProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select("-password");
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
  }

  return user;
};

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (query: any) => {
  const { search, role, status, page = 1, limit = 10 } = query;
  
  const filter: any = { isDeleted: false };
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }
  
  if (role) filter.role = role;
  if (status) filter.status = status;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const users = await User.find(filter)
    .select("-password")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(filter);
  
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
const getAllGuides = async (query: any) => {
  const { city, expertise, minRating, maxPrice, language, search } = query;
  
  const filter: any = { 
    role: UserRole.GUIDE, 
    status: UserStatus.ACTIVE,
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
  
  const guides = await User.find(filter)
    .select("-password -wishlist -travelPreferences -authProviders")
    .sort({ rating: -1, totalReviews: -1 });
  
  return guides;
};

/**
 * Search user by email
 */
const searchUserByEmail = async (email: string): Promise<IUser | null> => {
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }
  
  const user = await User.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, "i") } 
  }).select("-password");
  
  return user;
};

/**
 * Update user status (Admin only)
 */
const updateUserStatus = async (
  userId: string, 
  status: UserStatus
): Promise<IUser> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  if (!Object.values(UserStatus).includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
  }
  
  user.status = status;
  await user.save();
  
  return user;
};

/**
 * Get all listings with filtering
 */
const getAllListingsFromDB = async (query: Record<string, unknown>) => {
  const queryObj = { ...query };
  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);

  let searchTerm = '';
  if (query?.searchTerm) {
    searchTerm = query.searchTerm as string;
  }

  const searchableFields = ['title', 'location.city', 'category'];
  
  const searchQuery = Listing.find({
    $or: searchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    })),
  }).find(queryObj);

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await searchQuery
    .sort((query?.sort as string) || '-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('guide', 'name email');

  const total = await Listing.countDocuments();

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
const addToWishlist = async (userId: string, tourId: string) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  if (user.role !== UserRole.TOURIST) {
    throw new AppError(httpStatus.FORBIDDEN, "Only tourists can add to wishlist");
  }
  
  if (user.wishlist?.includes(tourId as any)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Tour already in wishlist");
  }
  
  user.wishlist = [...(user.wishlist || []), tourId as any];
  await user.save();
  
  return user.wishlist;
};

/**
 * Remove from wishlist
 */
const removeFromWishlist = async (userId: string, tourId: string) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  user.wishlist = user.wishlist?.filter(id => 
    id.toString() !== tourId
  ) || [];
  
  await user.save();
  
  return user.wishlist;
};

/**
 * Get user by ID
 */
const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  return user;
};

export const UserServices = {
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