import { UserRole, UserStatus } from './user.interface';
// // src/app/modules/users/user.service.ts

// import httpStatus from "http-status-codes";
// import bcrypt from "bcryptjs";
// import { JwtPayload } from "jsonwebtoken";
// import AppError from "../../utils/AppError";
// import { IUser, UserRole, UserStatus } from "./user.interface";
// import { User } from "./user.model";
// import { Listing } from "../listings/listing.model";
// import config from "../../config/config";
 

// /**
//  * Create a new user (Registration)
//  */
// const createUser = async (payload: Partial<IUser>) => {
//   const { email, password, role = UserRole.TOURIST, ...rest } = payload;

//   if (!email || !password) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
//   }

//   // Check if user exists
//   const isUserExist = await User.findOne({ email });
//   if (isUserExist) {
//     throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
//   }

//   // Hash password
//   const hashedPassword = await bcrypt.hash(password as string, config.bcrypt_salt_rounds);

//   // Create user
//   const newUser = await User.create({
//     ...rest,
//     email,
//     password: hashedPassword,
//     role,
//     status: UserStatus.ACTIVE,
//     isVerified: false,
//     isDeleted: false,
//   });

//   return newUser;
// };

// /**
//  * Update user - Sir's style with proper authorization
//  */
// const updateUser = async (
//   userId: string,
//   payload: Partial<IUser>,
//   decodedToken: JwtPayload
// ) => {
//   // ১. ইউজার এক্সিস্ট করে কিনা চেক করা
//   const ifUserExist = await User.findById(userId);
//   if (!ifUserExist) {
//     throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
//   }

//   /**
//    * Authorization Rules:
//    * - email - cannot update
//    * - name, phone, address - anyone can update their own
//    * - password - needs rehashing
//    * - role, isDeleted, isVerified, status - only admin/super_admin
//    * - promoting to super_admin - only super_admin
//    */

//   // ২. ইমেইল আপডেট রেস্ট্রিকশন
//   if (payload.email) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email address cannot be updated directly");
//   }

//   // ৩. রোল আপডেজ চেক (শুধু অ্যাডমিন/সুপার অ্যাডমিন)
//   if (payload.role) {
//     // সাধারণ ইউজার বা গাইড রোল আপডেট করতে পারবে না
//     if (decodedToken.role === UserRole.TOURIST || decodedToken.role === UserRole.GUIDE) {
//       throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update role");
//     }

//     // অ্যাডমিন কখনো সুপার অ্যাডমিন বানাতে পারবে না (শুধু সুপার অ্যাডমিন)
//     if (payload.role === UserRole.SUPER_ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
//       throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can create another Super Admin");
//     }
//   }

//   // ৪. সেনসিটিভ ফিল্ড চেক (status, isDeleted, isVerified)
//   if (payload.status || payload.isDeleted !== undefined || payload.isVerified !== undefined) {
//     if (decodedToken.role !== UserRole.ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
//       throw new AppError(httpStatus.FORBIDDEN, "Only Admins can update status or verification fields");
//     }
//   }

//   // ৫. পাসওয়ার্ড আপডেট হলে রি-হ্যাশ করুন
//   if (payload.password) {
//     payload.password = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);
//   }

//   // ৬. ডাটা আপডেট করা
//   const newUpdatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $set: payload },
//     { new: true, runValidators: true }
//   ).select("-password"); // পাসওয়ার্ড বাদ দিয়ে রিটার্ন

//   return newUpdatedUser;
// };

// /**
//  * Get my profile
//  */
// const getMyProfile = async (userId: string): Promise<IUser> => {
//   const user = await User.findById(userId).select("-password");
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }

//   if (user.status !== UserStatus.ACTIVE) {
//     throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
//   }

//   return user;
// };

// /**
//  * Get all users (Admin only)
//  */
// const getAllUsers = async (query: any) => {
//   const { search, role, status, page = 1, limit = 10 } = query;
  
//   const filter: any = { isDeleted: false };
  
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { email: { $regex: search, $options: "i" } }
//     ];
//   }
  
//   if (role) filter.role = role;
//   if (status) filter.status = status;
  
//   const skip = (Number(page) - 1) * Number(limit);
  
//   const users = await User.find(filter)
//     .select("-password")
//     .skip(skip)
//     .limit(Number(limit))
//     .sort({ createdAt: -1 });
  
//   const total = await User.countDocuments(filter);
  
//   return {
//     data: users,
//     meta: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       pages: Math.ceil(total / Number(limit)),
//     },
//   };
// };

// /**
//  * Get all guides (Public)
//  */
// const getAllGuides = async (query: any) => {
//   const { city, expertise, minRating, maxPrice, language, search } = query;
  
//   const filter: any = { 
//     role: UserRole.GUIDE, 
//     status: UserStatus.ACTIVE,
//     isVerified: true 
//   };
  
//   // Apply filters
//   if (city) {
//     filter['location.city'] = { $regex: city, $options: "i" };
//   }
  
//   if (expertise) {
//     filter.expertise = { $in: expertise.split(",") };
//   }
  
//   if (minRating) {
//     filter.rating = { $gte: Number(minRating) };
//   }
  
//   if (maxPrice) {
//     filter.dailyRate = { $lte: Number(maxPrice) };
//   }
  
//   if (language) {
//     filter.languages = { $in: [language] };
//   }
  
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { bio: { $regex: search, $options: "i" } }
//     ];
//   }
  
//   const guides = await User.find(filter)
//     .select("-password -wishlist -travelPreferences -authProviders")
//     .sort({ rating: -1, totalReviews: -1 });
  
//   return guides;
// };

// /**
//  * Search user by email
//  */
// const searchUserByEmail = async (email: string): Promise<IUser | null> => {
//   if (!email) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
//   }
  
//   const user = await User.findOne({ 
//     email: { $regex: new RegExp(`^${email}$`, "i") } 
//   }).select("-password");
  
//   return user;
// };

// /**
//  * Update user status (Admin only)
//  */
// const updateUserStatus = async (
//   userId: string, 
//   status: UserStatus
// ): Promise<IUser> => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   // Validate status
//   if (!Object.values(UserStatus).includes(status)) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
//   }
  
//   user.status = status;
//   await user.save();
  
//   return user;
// };

// /**
//  * Get all listings with filtering
//  */
// const getAllListingsFromDB = async (query: Record<string, unknown>) => {
//   // ১. বেসিক ফিল্টারিং
//   const queryObj = { ...query };
//   const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
//   excludeFields.forEach((el) => delete queryObj[el]);

//   // ২. সার্চিং লজিক
//   let searchTerm = '';
//   if (query?.searchTerm) {
//     searchTerm = query.searchTerm as string;
//   }

//   const searchableFields = ['title', 'location.city', 'category'];
  
//   let searchQuery = Listing.find(queryObj);
  
//   if (searchTerm) {
//     searchQuery = searchQuery.find({
//       $or: searchableFields.map((field) => ({
//         [field]: { $regex: searchTerm, $options: 'i' },
//       })),
//     });
//   }

//   // ৩. সর্টিং এবং পেজিনেশন
//   const page = Number(query?.page) || 1;
//   const limit = Number(query?.limit) || 10;
//   const skip = (page - 1) * limit;

//   const data = await searchQuery
//     .sort((query?.sort as string) || '-createdAt')
//     .skip(skip)
//     .limit(limit)
//     .populate('guide', 'name email profilePicture rating');

//   const total = await Listing.countDocuments(queryObj);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPage: Math.ceil(total / limit),
//     },
//     data,
//   };
// };

// /**
//  * Add to wishlist (Tourist only)
//  */
// const addToWishlist = async (userId: string, tourId: string) => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   if (user.role !== UserRole.TOURIST) {
//     throw new AppError(httpStatus.FORBIDDEN, "Only tourists can add to wishlist");
//   }
  
//   // Check if already in wishlist
//   if (user.wishlist?.includes(tourId as any)) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Tour already in wishlist");
//   }
  
//   user.wishlist = [...(user.wishlist || []), tourId as any];
//   await user.save();
  
//   return user.wishlist;
// };

// /**
//  * Remove from wishlist
//  */
// const removeFromWishlist = async (userId: string, tourId: string) => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   user.wishlist = user.wishlist?.filter(id => 
//     id.toString() !== tourId
//   ) || [];
  
//   await user.save();
  
//   return user.wishlist;
// };

// /**
//  * Get user by ID
//  */
// const getUserById = async (userId: string) => {
//   const user = await User.findById(userId).select("-password");
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   return user;
// };

// export const UserServices = {
//   createUser,
//   updateUser,
//   getMyProfile,
//   getAllUsers,
//   getAllGuides,
//   searchUserByEmail,
//   updateUserStatus,
//   addToWishlist,
//   removeFromWishlist,
//   getUserById,
//   getAllListingsFromDB
// };








// import httpStatus from "http-status-codes";
// import bcrypt from "bcryptjs";
// import AppError from "../../utils/AppError";  
// import { IUser, UserRole, UserStatus } from "./user.interface";
// import { User } from "./user.model";
// import { Listing } from "../listings/listing.model";
// import { JwtPayload } from "jsonwebtoken";
// import { env } from 'process';

// /**
//  * Create a new user (Registration)
//  */
// const createUser = async (payload: Partial<IUser>) => {
//   const { email, password, role = UserRole.TOURIST, ...rest } = payload;

//   if (!email || !password) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
//   }

//   // Check if user exists
//   const isUserExist = await User.findOne({ email });
//   if (isUserExist) {
//     throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
//   }

//   // Hash password
//   const hashedPassword = await bcrypt.hash(password as string, 10);

//   // Create user
//   const newUser = await User.create({
//     ...rest,
//     email,
//     password: hashedPassword,
//     role,
//     status: UserStatus.ACTIVE,
//     isVerified: false,
//     isDeleted: false,
//   });

//   return newUser;
// };

// // const updateUser = async (
// //   userId: string,
// //   payload: Partial<IUser>,
// //   decodedToken: JwtPayload
// // ) => {
// //   // ১. ইউজার এক্সিস্ট করে কিনা চেক করা
// //   const ifUserExist = await User.findById(userId);
// //   if (!ifUserExist) {
// //     throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
// //   }

// //   // ২. সেলফ আপডেট চেক (Tourist/Guide শুধু নিজেদের ডাটা আপডেট করতে পারবে)
// //   if (
// //     decodedToken.role === UserRole.TOURIST ||
// //     decodedToken.role === UserRole.GUIDE
// //   ) {
// //     if (userId !== decodedToken.userId) {
// //       throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update this profile");
// //     }
// //   }

// //   // ৩. অ্যাডমিন প্রোটেকশন (Admin কখনও Super Admin এর ডাটা আপডেট করতে পারবে না)
// //   if (
// //     decodedToken.role === UserRole.ADMIN &&
// //     ifUserExist.role === UserRole.SUPER_ADMIN
// //   ) {
// //     throw new AppError(httpStatus.UNAUTHORIZED, "Admins cannot modify Super Admin profiles");
// //   }

// //   // ৪. সেনসিটিভ ফিল্ড রেস্ট্রিকশন (Role, Status, isDeleted, isVerified)
// //   // শুধুমাত্র Admin বা Super Admin এই ফিল্ডগুলো চেঞ্জ করতে পারবে
// //   const sensitiveFields = ["role", "status", "isDeleted", "isVerified"];
// //   const isUpdatingSensitiveField = sensitiveFields.some((field) => field in payload);

// //   if (isUpdatingSensitiveField) {
// //     if (
// //       decodedToken.role !== UserRole.ADMIN &&
// //       decodedToken.role !== UserRole.SUPER_ADMIN
// //     ) {
// //       throw new AppError(
// //         httpStatus.FORBIDDEN,
// //         "Only Admins can update role, status, or verification fields"
// //       );
// //     }
// //   }

// //   // ৫. ইমেইল আপডেট রেস্ট্রিকশন (সাধারণত ইমেইল চেঞ্জ করতে দেওয়া হয় না সরাসরি)
// //   if (payload.email) {
// //     throw new AppError(httpStatus.BAD_REQUEST, "Email address cannot be updated directly");
// //   }

// //   // ৬. ডাটা আপডেট করা
// //   const updatedUser = await User.findByIdAndUpdate(
// //     userId,
// //     { $set: payload },
// //     {
// //       new: true,
// //       runValidators: true,
// //     }
// //   ).select("-password"); // পাসওয়ার্ড যাতে রিটার্ন না করে

// //   return updatedUser;
// // };
// const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

//     const ifUserExist = await User.findById(userId);

//     if (!ifUserExist) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }

//     /**
//      * email - can not update
//      * name, phone, password address
//      * password - re hashing
//      *  only admin superadmin - role, isDeleted...
//      * 
//      * promoting to superadmin - superadmin
//      */

//     if (payload.role) {
//         if (decodedToken.role === Role.TOURIST || decodedToken.role === Role.GUIDE) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }

//         if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }
//     }

//     if (payload.UserStatus.ACTIVE || payload.isDeleted || payload.isVerified) {
//         if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }
//     }

//     if (payload.password) {
//         payload.password = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUND)
//     }

//     const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

//     return newUpdatedUser
// }


// /**
//  * Get my profile
//  */
// const getMyProfile = async (userId: string): Promise<IUser> => {
//   const user = await User.findById(userId).select("-password");
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }

//   if (user.status !== UserStatus.ACTIVE) {
//     throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
//   }

//   return user;
// };

// /**
//  * Get all users (Admin only)
//  */
// const getAllUsers = async (query: any) => {
//   const { search, role, status, page = 1, limit = 10 } = query;
  
//   const filter: any = { isDeleted: false };
  
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { email: { $regex: search, $options: "i" } }
//     ];
//   }
  
//   if (role) filter.role = role;
//   if (status) filter.status = status;
  
//   const skip = (Number(page) - 1) * Number(limit);
  
//   const users = await User.find(filter)
//     .select("-password")
//     .skip(skip)
//     .limit(Number(limit))
//     .sort({ createdAt: -1 });
  
//   const total = await User.countDocuments(filter);
  
//   return {
//     data: users,
//     meta: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       pages: Math.ceil(total / Number(limit)),
//     },
//   };
// };

// /**
//  * Get all guides (Public)
//  */
// const getAllGuides = async (query: any) => {
//   const { city, expertise, minRating, maxPrice, language, search } = query;
  
//   const filter: any = { 
//     role: UserRole.GUIDE, 
//     status: UserStatus.ACTIVE,
//     isVerified: true 
//   };
  
//   // Apply filters
//   if (city && filter.location) {
//     filter['location.city'] = { $regex: city, $options: "i" };
//   }
  
//   if (expertise) {
//     filter.expertise = { $in: expertise.split(",") };
//   }
  
//   if (minRating) {
//     filter.rating = { $gte: Number(minRating) };
//   }
  
//   if (maxPrice) {
//     filter.dailyRate = { $lte: Number(maxPrice) };
//   }
  
//   if (language) {
//     filter.languages = { $in: [language] };
//   }
  
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { bio: { $regex: search, $options: "i" } }
//     ];
//   }
  
//   const guides = await User.find(filter)
//     .select("-password -wishlist -travelPreferences -authProviders")
//     .sort({ rating: -1, totalReviews: -1 });
  
//   return guides;
// };

// /**
//  * Search user by email
//  */
// const searchUserByEmail = async (email: string): Promise<IUser | null> => {
//   if (!email) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
//   }
  
//   const user = await User.findOne({ 
//     email: { $regex: new RegExp(`^${email}$`, "i") } 
//   }).select("-password");
  
//   return user;
// };

// /**
//  * Update user status (Admin only)
//  */
// const updateUserStatus = async (
//   userId: string, 
//   status: UserStatus
// ): Promise<IUser> => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   // Validate status
//   if (!Object.values(UserStatus).includes(status)) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
//   }
  
//   user.status = status;
//   await user.save();
  
//   return user;
// };

// /**
//  * Get all listings with filtering
//  */
// const getAllListingsFromDB = async (query: Record<string, unknown>) => {
//   // ১. বেসিক ফিল্টারিং (যদি কুয়েরি প্যারাম থাকে)
//   const queryObj = { ...query };
//   const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
//   excludeFields.forEach((el) => delete queryObj[el]);

//   // ২. সার্চিং লজিক (নাম বা লোকেশন দিয়ে সার্চ)
//   let searchTerm = '';
//   if (query?.searchTerm) {
//     searchTerm = query.searchTerm as string;
//   }

//   const searchableFields = ['title', 'location.city', 'category'];
  
//   let searchQuery = Listing.find(queryObj);
  
//   if (searchTerm) {
//     searchQuery = searchQuery.find({
//       $or: searchableFields.map((field) => ({
//         [field]: { $regex: searchTerm, $options: 'i' },
//       })),
//     });
//   }

//   // ৩. সর্টিং এবং পেজিনেশন
//   const page = Number(query?.page) || 1;
//   const limit = Number(query?.limit) || 10;
//   const skip = (page - 1) * limit;

//   const data = await searchQuery
//     .sort((query?.sort as string) || '-createdAt')
//     .skip(skip)
//     .limit(limit)
//     .populate('guide', 'name email profilePicture rating');

//   const total = await Listing.countDocuments(queryObj);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPage: Math.ceil(total / limit),
//     },
//     data,
//   };
// };

// /**
//  * Add to wishlist (Tourist only)
//  */
// const addToWishlist = async (userId: string, tourId: string) => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   if (user.role !== UserRole.TOURIST) {
//     throw new AppError(httpStatus.FORBIDDEN, "Only tourists can add to wishlist");
//   }
  
//   // Check if already in wishlist
//   if (user.wishlist?.includes(tourId as any)) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Tour already in wishlist");
//   }
  
//   user.wishlist = [...(user.wishlist || []), tourId as any];
//   await user.save();
  
//   return user.wishlist;
// };

// /**
//  * Remove from wishlist
//  */
// const removeFromWishlist = async (userId: string, tourId: string) => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   user.wishlist = user.wishlist?.filter(id => 
//     id.toString() !== tourId
//   ) || [];
  
//   await user.save();
  
//   return user.wishlist;
// };

// /**
//  * Get user by ID
//  */
// const getUserById = async (userId: string) => {
//   const user = await User.findById(userId).select("-password");
  
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
  
//   return user;
// };

// export const UserServices = {
//   createUser,
//   updateUser,
//   getMyProfile,
//   getAllUsers,
//   getAllGuides,
//   searchUserByEmail,
//   updateUserStatus,
//   addToWishlist,
//   removeFromWishlist,
//   getUserById,
//   getAllListingsFromDB
// }; 



import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import AppError from "../../utils/AppError";  
import { IUser} from "./user.interface";
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
    throw new AppError(httpStatus.BAD_REQUEST,"Email and password are required", );
  }

  // Check if user exists
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST,"User already exists", );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password as string, 10);

  // Create user
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
// const updateUser = async (
//   userId: string,
//   payload: Partial<IUser>,
//   authUser: { _id: string; role: string }
// ) => {
//   // এডমিন ছাড়া অন্য কেউ নিজের আইডি ছাড়া অন্য কারো ডাটা আপডেট করতে পারবে না
//   if (authUser.role !== UserRole.ADMIN && authUser._id !== userId) {
//     throw new AppError(httpStatus.FORBIDDEN, "You can only update your own profile");
//   }

//   const existingUser = await User.findById(userId);

//   if (!existingUser) {
//     throw new AppError(httpStatus.NOT_FOUND,"User not found", );
//   }

//   // Prevent email update
//   if (payload.email) {
//     throw new AppError( httpStatus.BAD_REQUEST,"Email cannot be updated",);
//   }

//   // Role-based restrictions
//   if (payload.role) {
//     if (authUser.role !== UserRole.ADMIN) {
//       throw new AppError( httpStatus.FORBIDDEN,"Only admin can change roles",);
//     }
//   }

//   // Admin-only fields
//   const adminOnlyFields = ['status', 'isVerified', 'rating', 'totalReviews'];
//   const hasAdminField = Object.keys(payload).some(key => 
//     adminOnlyFields.includes(key)
//   );
  
//   if (hasAdminField && authUser.role !== UserRole.ADMIN) {
//     throw new AppError( httpStatus.FORBIDDEN,"You are not authorized to update this field",);
//   }

//   // Hash password if updated
//   if (payload.password) {
//     payload.password = await bcrypt.hash(payload.password, 10);
//   }

//   // Update user
//   const updatedUser = await User.findByIdAndUpdate(userId, payload, {
//     new: true,
//     runValidators: true,
//   }).select("-password");

//   return updatedUser;
// };
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    // ============ AUTHORIZATION CHECKS ============

    // 1. সাধারণ ইউজার (Tourist/Guide) শুধু নিজেদের প্রোফাইল আপডেট করতে পারবে
    if (decodedToken.role === UserRole.TOURIST || decodedToken.role === UserRole.GUIDE) {
        if (userId !== decodedToken._id) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update this profile");
        }
    }

    // 2. ইউজার এক্সিস্ট করে কিনা চেক করুন
    const ifUserExist = await User.findById(userId);
    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    // 3. অ্যাডমিন কখনো সুপার অ্যাডমিন আপডেট করতে পারবে না
    if (decodedToken.role === UserRole.ADMIN && ifUserExist.role === UserRole.SUPER_ADMIN) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Admins cannot modify Super Admin profiles");
    }

    // ============ FIELD VALIDATIONS ============

    /**
     * Update Rules:
     * - email: cannot update
     * - name, phone, address: anyone can update their own
     * - password: needs rehashing
     * - role, status, isDeleted, isVerified: only admin/superadmin
     */

    // 4. ইমেইল আপডেট রেস্ট্রিকশন
    if (payload.email) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email address cannot be updated directly");
    }

    // 5. রোল আপডেট চেক (শুধু অ্যাডমিন/সুপার অ্যাডমিন)
    if (payload.role) {
        if (decodedToken.role !== UserRole.ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "Only admins can update role");
        }

        // অ্যাডমিন কখনো সুপার অ্যাডমিন বানাতে পারবে না
        if (payload.role === UserRole.SUPER_ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can create another Super Admin");
        }
    }

    // 6. সেনসিটিভ ফিল্ড চেক (status, isDeleted, isVerified)
    const sensitiveFields = ['status', 'isDeleted', 'isVerified'];
    const isUpdatingSensitiveField = sensitiveFields.some(field => field in payload);

    if (isUpdatingSensitiveField) {
        if (decodedToken.role !== UserRole.ADMIN && decodedToken.role !== UserRole.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "Only admins can update status, isDeleted, or isVerified fields");
        }
    }

    // 7. পাসওয়ার্ড আপডেট হলে রি-হ্যাশ করুন
    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);
    }

    // ============ UPDATE USER ============

    const newUpdatedUser = await User.findByIdAndUpdate(
        userId, 
        { $set: payload },
        { new: true, runValidators: true }
    ).select("-password"); // পাসওয়ার্ড বাদ দিয়ে রিটার্ন

    return newUpdatedUser;
};

/**
 * Get my profile
 */
const getMyProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select("-password");
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,"User not found", );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN,"User account is not active", );
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
  
  // Apply filters
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
    throw new AppError(httpStatus.BAD_REQUEST,"Email is required" );
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
    throw new AppError(httpStatus.NOT_FOUND,"User not found" );
  }
  
  // Validate status
  if (!Object.values(UserStatus).includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST,"Invalid status value", );
  }
  
  user.status = status;
  await user.save();
  
  return user;
};
const getAllListingsFromDB = async (query: Record<string, unknown>) => {
  // ১. বেসিক ফিল্টারিং (যদি কুয়েরি প্যারাম থাকে)
  const queryObj = { ...query };
  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);

  // ২. সার্চিং লজিক (নাম বা লোকেশন দিয়ে সার্চ)
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

  // ৩. সর্টিং এবং পেজিনেশন
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await searchQuery
    .sort((query?.sort as string) || '-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('guide', 'name email'); // গাইডের ইনফো দেখানোর জন্য

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
    throw new AppError(httpStatus.NOT_FOUND,"User not found", );
  }
  
  if (user.role !== UserRole.TOURIST) {
    throw new AppError(httpStatus.FORBIDDEN,"Only tourists can add to wishlist" );
  }
  
  // Check if already in wishlist
  if (user.wishlist?.includes(tourId as any)) {
    throw new AppError(httpStatus.BAD_REQUEST,"Tour already in wishlist" );
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
    throw new AppError(httpStatus.NOT_FOUND,"User not found" );
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
    throw new AppError(httpStatus.NOT_FOUND,"User not found" );
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
  getUserById,getAllListingsFromDB
};