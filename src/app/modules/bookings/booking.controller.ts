import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import bookingService from "./booking.service";
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

export const BookingController = {
  createBooking,
  getBookingById,
  getMyBookings,
  getBookingsForGuide,
  confirmBooking,
  declineBooking,
  cancelBooking,
  completeBooking
};