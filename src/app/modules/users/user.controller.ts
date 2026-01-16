import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import AppError from "../../utils/AppError";  
// Create a new user (Registration)
const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    }
  });
});

// Get my profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const user = await UserServices.getMyProfile(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile retrieved successfully",
    data: user,
  });
});

// Update user profile
// const updateUser = catchAsync(async (req: Request, res: Response) => {
//   const authUser = req.user as { _id: string; role: string };
  
//   // params থেকে না নিয়ে সরাসরি authUser থেকে আইডি নিন
//   const id = authUser._id; 
  
//   let payload = req.body;
//   if (req.body.data) {
//     payload = JSON.parse(req.body.data);
//   }

//   // if (req.file) {
//   //   payload.profilePicture = (req.file as any).path; 
//   // }

//   const updatedUser = await UserServices.updateUser(id, payload, authUser);
  
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "User updated successfully",
//     data: updatedUser,
//   });
// });
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const authUser = req.user as { _id: string; role: string };
  const id = authUser._id; 

  // ১. Cookies থেকে Refresh Token নেওয়া (এখন এটি রেসপন্সে ব্যবহার করা হবে)
  const refreshToken = req.cookies?.refreshToken;

  // ২. পে-লোড হ্যান্ডেল করা (FormData বা JSON)
  let payload: any = {};
  if (req.body && req.body.data) {
    try {
      payload = JSON.parse(req.body.data);
    } catch (err) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid JSON in 'data' field");
    }
  } else {
    payload = { ...req.body };
  }

  // ৩. ইমেজ ফাইল আপডেট (Multer middleware থাকলে)
  const file = (req as any).file;
  if (file) {
    payload.profilePicture = file.path; 
  }

  // ৪. সার্ভিস কল করে ডাটা আপডেট
  const updatedUser = await UserServices.updateUser(id, payload, authUser);
  
  // ৫. রেসপন্স পাঠানো
  // এখানে refreshToken টি 'data' এর ভেতরে পাঠিয়ে দিচ্ছি অথবা 
  // শুধু ওয়ার্নিং দূর করতে চাইলে এটি মেটা ডাটাতে রাখতে পারেন।
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: {
      user: updatedUser,
      refreshToken: refreshToken // এখন এটি রিড করা হলো
    },
  });
});
// Get all users (Admin only)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

// Get all guides (Public)
const getAllGuides = catchAsync(async (req: Request, res: Response) => {
  const guides = await UserServices.getAllGuides(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guides fetched successfully",
    data: guides,
  });
});

// Search user by email
const searchUserByEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.query;
  
  if (!email || typeof email !== "string") {
    throw new AppError(httpStatus.BAD_REQUEST,"Email query parameter is required", );
  }
  
  const user = await UserServices.searchUserByEmail(email);
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,"User not found" );
  }
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User found successfully",
    data: user,
  });
});

// Update user status (Admin only)
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    throw new AppError(httpStatus.BAD_REQUEST,"Status field is required" );
  }
  
  const updatedUser = await UserServices.updateUserStatus(id, status);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: updatedUser,
  });
});
const getAllListings = catchAsync(async (req: Request, res: Response) => {
  // রিকোয়েস্ট কুয়েরি (pagination, filtering) সার্ভিসে পাঠানো হচ্ছে
  const result = await UserServices.getAllListingsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All listings retrieved successfully',
    meta: result.meta, // Pagination তথ্য
    data: result.data,
  });
});
// Add to wishlist (Tourist only)
const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { tourId } = req.body;
  
  if (!tourId) {
    throw new AppError(httpStatus.BAD_REQUEST,"Tour ID is required" );
  }
  
  const wishlist = await UserServices.addToWishlist(userId, tourId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Added to wishlist successfully",
    data: { wishlist },
  });
});

// Remove from wishlist
const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { tourId } = req.params;
  
  const wishlist = await UserServices.removeFromWishlist(userId, tourId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Removed from wishlist successfully",
    data: { wishlist },
  });
});

// Get user by ID (Public)
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserServices.getUserById(id);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User fetched successfully",
    data: user,
  });
});

export const UserControllers = {
  createUser,
  getMyProfile,
  updateUser,
  getAllUsers,
  getAllGuides,
  searchUserByEmail,
  updateUserStatus,
  addToWishlist,
  removeFromWishlist,
  getUserById,getAllListings
};