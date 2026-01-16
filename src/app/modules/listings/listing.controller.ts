import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import listingService, { GuideService } from "./listing.service";
import { UserRole } from "../users/user.interface";

// export const createListing = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   const listing = await listingService.createListing(req.body, guideId);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Listing created successfully",
//     data: listing
//   });
// });
export const createListing = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  
  console.log('=== CREATE LISTING REQUEST START ===');
  console.log('Guide ID:', guideId);
  console.log('Full request body:', req.body);
  console.log('Images array:', req.body.images);
  console.log('Images type:', typeof req.body.images);
  console.log('Images length:', Array.isArray(req.body.images) ? req.body.images.length : 'N/A');
  console.log('=== CREATE LISTING REQUEST END ===');
  
  try {
    const listing = await listingService.createListing(req.body, guideId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Listing created successfully",
      data: listing
    });
  } catch (error: any) {
    console.error('CREATE LISTING CATCH ERROR:', error);
    throw error;
  }
});
export const getListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const listing = await listingService.getListingById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing retrieved successfully",
    data: listing
  });
});

export const searchListings = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 12, ...filters } = req.query;
  
  const result = await listingService.searchListings(
    filters as any,
    parseInt(page as string),
    parseInt(limit as string)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listings retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

export const getMyListings = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const listings = await listingService.getListingsByGuide(guideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your listings retrieved successfully",
    data: listings
  });
});

export const updateListing = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const { id } = req.params;
  
  const listing = await listingService.updateListing(id, guideId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing updated successfully",
    data: listing
  });
});

export const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const userRole = (req as any).user.role;
  const { id } = req.params;
  
  if (userRole === UserRole.ADMIN) {
    await listingService.deleteListing(id, userId, userRole);
  } else {
    await listingService.deleteListing(id, userId, userRole);
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing deleted successfully",
    data: null
  });
});
export const getGuideDashboard = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user._id;
  const result = await GuideService.getGuideDashboardData(guideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide dashboard data retrieved",
    data: result,
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