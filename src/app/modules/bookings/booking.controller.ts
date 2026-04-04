import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import  bookingService, { BookingServices     } from "./booking.service";
import { BookingStatus } from "./booking.interface";
import AppError from "../../utils/AppError";
 

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;
  const { listingId, date, guestCount } = req.body;

  const booking = await bookingService.createBooking(
    { listingId, date: new Date(date), guestCount },
    touristId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created successfully",
    data: booking
  });
});

export const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params;

  const booking = await bookingService.getBookingById(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: booking
  });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user._id;

  const bookings = await bookingService.getMyBookings(touristId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your bookings retrieved successfully",
    data: bookings
  });
});

export const getBookingsForGuide = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;

  const bookings = await bookingService.getBookingsForGuide(guideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide bookings retrieved successfully",
    data: bookings
  });
});

export const confirmBooking = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const { id } = req.params;

  const booking = await bookingService.updateBookingStatus(id, guideId, BookingStatus.CONFIRMED);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking confirmed successfully",
    data: booking
  });
});

export const declineBooking = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const { id } = req.params;

  const booking = await bookingService.updateBookingStatus(id, guideId, BookingStatus.DECLINED);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking declined successfully",
    data: booking
  });
});

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params;

  await bookingService.cancelBooking(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking cancelled successfully",
    data: null
  });
});

export const completeBooking = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const { id } = req.params;

  const booking = await bookingService.completeBooking(id, guideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking completed successfully",
    data: booking
  });
});
// Get all bookings (Admin only) - SIMPLE
// Get all bookings for admin
const getAllBookingsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result: any = await BookingServices.getAllBookingsForAdmin();
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings fetched successfully",
    data: result.bookings,
    meta: {
      totalBookings: result.totalBookings,
      paidBookings: result.paidBookings,
      unpaidBookings: result.unpaidBookings,
      totalRevenue: result.totalRevenue
    }
  });
});

// Get booking statistics for admin
const getBookingStatsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const stats = await BookingServices.getBookingStatsForAdmin();
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking stats fetched successfully",
    data: stats,
  });
});

// Get booking by ID for admin
const getBookingByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const booking = await BookingServices.getBookingByIdForAdmin(id);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking details fetched successfully",
    data: booking,
  });
});

// Update booking status (Admin only)
const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
  }
  
  const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
  }
  
  const updatedBooking = await BookingServices.updateBookingStatus(id, status);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: updatedBooking,
  });
});

// Update payment status (Admin only)
const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  
  if (!paymentStatus) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment status is required");
  }
  
  const validPaymentStatuses = ["PAID", "UNPAID", "REFUNDED"];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment status value");
  }
  
  const updatedBooking = await BookingServices.updatePaymentStatus(id, paymentStatus);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment status updated successfully",
    data: updatedBooking,
  });
});

export const BookingControllers = {
  getAllBookingsForAdmin,
  getBookingStatsForAdmin,
  getBookingByIdForAdmin,
  updateBookingStatus,
  updatePaymentStatus,
};

 
export const BookingController = {
  createBooking,
  getBookingById,
  getMyBookings,
  getBookingsForGuide,
  confirmBooking,
  declineBooking,
  cancelBooking,
  completeBooking,getAllBookingsForAdmin,
 
};