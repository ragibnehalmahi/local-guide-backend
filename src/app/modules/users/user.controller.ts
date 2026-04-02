// src/app/modules/users/user.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import AppError from "../../utils/AppError";
import { JwtPayload } from "jsonwebtoken";

// ==================== REGISTER USER ====================
const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: user
  });
});

// ==================== GET MY PROFILE ====================
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const user = await UserServices.getMyProfile(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile retrieved successfully",
    data: user
  });
});

// ==================== GET USER BY ID ====================
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserServices.getUserById(id);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: user
  });
});

// ==================== UPDATE USER ====================
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const verifiedToken = req.user as JwtPayload;
  const payload = req.body;

  const user = await UserServices.updateUser(userId, payload, verifiedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: user
  });
});

// ==================== UPDATE MY PROFILE ====================
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const verifiedToken = req.user as JwtPayload;
  const payload = req.body;
  
  if (req.file) {
    payload.profilePicture = (req as any).file.path;
  }

  const user = await UserServices.updateUser(userId, payload, verifiedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: user
  });
});

// ==================== GET ALL USERS (ADMIN) ====================
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data
  });
});

// ==================== GET ALL GUIDES (PUBLIC) ====================
const getAllGuides = catchAsync(async (req: Request, res: Response) => {
  const guides = await UserServices.getAllGuides(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guides fetched successfully",
    data: guides,
  });
});

// ==================== UPDATE USER STATUS (ADMIN) ====================
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const updatedUser = await UserServices.updateUserStatus(id, status);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: updatedUser
  });
});

// ==================== ADD TO WISHLIST ====================
const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { tourId } = req.body;
  
  const wishlist = await UserServices.addToWishlist(userId, tourId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Added to wishlist successfully",
    data: { wishlist }
  });
});

// ==================== REMOVE FROM WISHLIST ====================
const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { tourId } = req.params;
  
  const wishlist = await UserServices.removeFromWishlist(userId, tourId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Removed from wishlist successfully",
    data: { wishlist }
  });
});

// ==================== SEARCH USER BY EMAIL ====================
const searchUserByEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.query;
  
  if (!email || typeof email !== "string") {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }
  
  const user = await UserServices.searchUserByEmail(email);
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User found",
    data: user
  });
});

export const UserControllers = {
  createUser,
  getMyProfile,
  getUserById,
  updateUser,
  updateMyProfile,
  getAllUsers,
  getAllGuides,
  updateUserStatus,
  addToWishlist,
  removeFromWishlist,
  searchUserByEmail
};