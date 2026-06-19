//local-guide-backend\src\app\modules\listings\listing.controller.ts

import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ListingService } from "./listing.service";
import { UserRole } from "../users/user.interface";
import AppError from "../../utils/AppError";

// ============ CREATE LISTING ============
const createListing = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;

  console.log('=== CREATE LISTING REQUEST ===');
  console.log('Full body:', req.body);

  const listingData = req.body;

  // Extract location data, supporting both nested and flat structures
  const address = listingData.location?.address || listingData.address;
  const city = listingData.location?.city || listingData.city;
  const country = listingData.location?.country || listingData.country;

  // Validate required fields
  if (!address || !city || !country) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Address, city and country are required');
  }

  if (!listingData.images || listingData.images.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'At least one image is required');
  }

  // Prepare final data for service
  const finalListingData = {
    title: listingData.title,
    description: listingData.description,
    price: Number(listingData.price),
    durationHours: Number(listingData.durationHours),
    maxGroupSize: Number(listingData.maxGroupSize),
    meetingPoint: listingData.meetingPoint,
    category: listingData.category,
    languages: listingData.languages || ['English'],
    images: listingData.images,
    location: {
      address,
      city,
      country
    },
    availableDates: listingData.availableDates || []
  };

  console.log('Final data:', {
    title: finalListingData.title,
    imagesCount: finalListingData.images.length,
    location: finalListingData.location
  });


  const listing = await ListingService.createListing(finalListingData, guideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Listing created successfully",
    data: listing
  });
});

// ============ GET LISTING BY ID ============
const getListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const listing = await ListingService.getListingById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing retrieved successfully",
    data: listing
  });
});

// ============ SEARCH LISTINGS ============
const searchListings = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 12, ...filters } = req.query;


  const result = await ListingService.searchListings(
    filters as any,
    parseInt(page as string),
    parseInt(limit as string)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

// ============ GET GUIDE'S LISTINGS ============
const getMyListings = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const listings = await ListingService.getListingsByGuide(guideId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your listings retrieved successfully",
    data: listings
  });
});

// ============ UPDATE LISTING ============
const updateListing = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const userRole = (req as any).user.role;
  const { id } = req.params;

  console.log('=== UPDATE LISTING REQUEST ===');
  console.log('ID:', id);
  console.log('User ID:', userId);


  const incomingData = req.body.data ? (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data) : req.body;


  if (incomingData.price !== undefined) incomingData.price = Number(incomingData.price);
  if (incomingData.durationHours !== undefined) incomingData.durationHours = Number(incomingData.durationHours);
  if (incomingData.maxGroupSize !== undefined) incomingData.maxGroupSize = Number(incomingData.maxGroupSize);

  const listing = await ListingService.updateListing(id, userId, userRole, incomingData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing updated successfully",
    data: listing
  });
});

// ============ DELETE LISTING ============
const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const userRole = (req as any).user.role;
  const { id } = req.params;

  await ListingService.deleteListing(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing deleted successfully",
    data: null
  });
});

// ============ GET GUIDE DASHBOARD ============
const getGuideDashboard = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const result = await ListingService.getGuideDashboardData(guideId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Guide dashboard data retrieved",
    data: result
  });
});

export const ListingController = {
  createListing,
  getListing,
  searchListings,
  getMyListings,
  updateListing,
  deleteListing,
  getGuideDashboard
};













