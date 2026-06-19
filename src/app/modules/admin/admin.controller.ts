// backend/src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
 

// ============ USER MANAGEMENT ============
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const searchUserByEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.query;
  const user = await AdminService.searchUserByEmail(email as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User found",
    data: user,
  });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedUser = await AdminService.updateUserStatus(id, status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated",
    data: updatedUser,
  });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const updatedUser = await AdminService.updateUserRole(id, role);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User role updated",
    data: updatedUser,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteUser(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted permanently",
    data: null,
  });
});

// ============ LISTING MANAGEMENT ============
export const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllListings(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listings fetched",
    meta: result.meta,
    data: result.data,
  });
});

export const updateListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedListing = await AdminService.updateListing(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing updated",
    data: updatedListing,
  });
});

export const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteListing(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing deleted permanently",
    data: null,
  });
});

// ============ BOOKING MANAGEMENT ============
export const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllBookings(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings fetched",
    meta: result.meta,
    data: result.data,
  });
});

export const getBookingStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AdminService.getBookingStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking stats fetched",
    data: stats,
  });
});

export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedBooking = await AdminService.updateBookingStatus(id, status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated",
    data: updatedBooking,
  });
});

export const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  const updatedBooking = await AdminService.updatePaymentStatus(id, paymentStatus);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment status updated",
    data: updatedBooking,
  });
});

// ============ REVIEW MANAGEMENT ============
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllReviews(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews fetched",
    meta: result.meta,
    data: result.data,
  });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const updatedReview = await AdminService.updateReview(id, { rating, comment });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated",
    data: updatedReview,
  });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteReview(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted",
    data: null,
  });
});