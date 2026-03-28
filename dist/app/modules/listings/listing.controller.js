"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const listing_service_1 = require("./listing.service");
const AppError_1 = __importDefault(require("../../utils/AppError"));
// ============ CREATE LISTING ============
const createListing = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    console.log('=== CREATE LISTING REQUEST ===');
    console.log('Full body:', req.body);
    const listingData = req.body;
    // Extract location data, supporting both nested and flat structures
    const address = listingData.location?.address || listingData.address;
    const city = listingData.location?.city || listingData.city;
    const country = listingData.location?.country || listingData.country;
    // Validate required fields
    if (!address || !city || !country) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Address, city and country are required');
    }
    if (!listingData.images || listingData.images.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'At least one image is required');
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
    // ✅ এখন static method হিসেবে কাজ করবে
    const listing = await listing_service_1.ListingService.createListing(finalListingData, guideId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Listing created successfully",
        data: listing
    });
});
// ============ GET LISTING BY ID ============
const getListing = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const listing = await listing_service_1.ListingService.getListingById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Listing retrieved successfully",
        data: listing
    });
});
// ============ SEARCH LISTINGS ============
const searchListings = (0, catchAsync_1.default)(async (req, res) => {
    const { page = 1, limit = 12, ...filters } = req.query;
    // ✅ এখন static method হিসেবে কাজ করবে
    const result = await listing_service_1.ListingService.searchListings(filters, parseInt(page), parseInt(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Listings retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});
// ============ GET GUIDE'S LISTINGS ============
const getMyListings = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    const listings = await listing_service_1.ListingService.getListingsByGuide(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Your listings retrieved successfully",
        data: listings
    });
});
// ============ UPDATE LISTING ============
const updateListing = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;
    console.log('=== UPDATE LISTING REQUEST ===');
    console.log('ID:', id);
    console.log('User ID:', userId);
    // ✅ Support req.body.data (matching createListing patterns)
    const incomingData = req.body.data ? (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data) : req.body;
    // Cast numbers if provided
    if (incomingData.price !== undefined)
        incomingData.price = Number(incomingData.price);
    if (incomingData.durationHours !== undefined)
        incomingData.durationHours = Number(incomingData.durationHours);
    if (incomingData.maxGroupSize !== undefined)
        incomingData.maxGroupSize = Number(incomingData.maxGroupSize);
    const listing = await listing_service_1.ListingService.updateListing(id, userId, userRole, incomingData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Listing updated successfully",
        data: listing
    });
});
// ============ DELETE LISTING ============
const deleteListing = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;
    await listing_service_1.ListingService.deleteListing(id, userId, userRole);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Listing deleted successfully",
        data: null
    });
});
// ============ GET GUIDE DASHBOARD ============
const getGuideDashboard = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user._id;
    const result = await listing_service_1.ListingService.getGuideDashboardData(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Guide dashboard data retrieved",
        data: result
    });
});
exports.ListingController = {
    createListing,
    getListing,
    searchListings,
    getMyListings,
    updateListing,
    deleteListing,
    getGuideDashboard
};
// import { Request, Response } from "express";
// import httpStatus from "http-status-codes";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
// import { ListingService } from "./listing.service";
// import { UserRole } from "../users/user.interface";
// import AppError from "../../utils/AppError";
// // Create listing with image upload
// const createListing = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   console.log('=== CREATE LISTING REQUEST ===');
//   // JSON data directly from body
//   const listingData = req.body; 
//   console.log('Listing data received:', {
//     title: listingData.title,
//     imagesCount: listingData.images?.length || 0
//   });
//   // Validate images
//   if (!listingData.images || listingData.images.length === 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'At least one image is required');
//   }
//   // Validate required fields
//   if (!listingData.address || !listingData.city || !listingData.country) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Address, city and country are required');
//   }
//   // Prepare location object
//   const location = {
//     address: listingData.address,
//     city: listingData.city,
//     country: listingData.country
//   };
//   // Prepare final data for service
//   const finalListingData = {
//     title: listingData.title,
//     description: listingData.description,
//     price: Number(listingData.price),
//     durationHours: Number(listingData.durationHours),
//     maxGroupSize: Number(listingData.maxGroupSize),
//     meetingPoint: listingData.meetingPoint,
//     category: listingData.category,
//     languages: listingData.languages || ['English'],
//     images: listingData.images, // Cloudinary URLs
//     location,
//     availableDates: listingData.availableDates || []
//   };
//   // Call service
//   const listing = await ListingService.createListing(finalListingData, guideId);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Listing created successfully",
//     data: listing
//   });
// });
// // Get listing by ID or slug
// const getListing = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const listing = await ListingService.getListingById(id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Listing retrieved successfully",
//     data: listing
//   });
// });
// // Search listings
// const searchListings = catchAsync(async (req: Request, res: Response) => {
//   const query = req.query;
//   const result = await ListingService.searchListings(query as Record<string, string>);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Listings retrieved successfully",
//     data: result.data,
//     meta: result.meta
//   });
// });
// // Get guide's listings
// const getMyListings = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   const listings = await ListingService.getListingsByGuide(guideId);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Your listings retrieved successfully",
//     data: listings
//   });
// });
// // Update listing
// const updateListing = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user._id;
//   const userRole = (req as any).user.role;
//   const { id } = req.params;
//   // Get existing listing
//   const existingListing = await ListingService.getListingById(id);
//   // Handle new images if uploaded
//   const files = req.files as Express.Multer.File[];
//   const newImageUrls = files?.map(file => file.path) || [];
//   // Parse update data
//   const updateData: any = { ...req.body };
//   // If new images uploaded, add to payload
//   if (newImageUrls.length > 0) {
//     updateData.images = newImageUrls;
//   }
//   // Parse languages if needed
//   if (updateData.languages && typeof updateData.languages === 'string') {
//     try {
//       updateData.languages = JSON.parse(updateData.languages);
//     } catch {
//       updateData.languages = [updateData.languages];
//     }
//   }
//   // Parse available dates
//   if (updateData.availableDates && typeof updateData.availableDates === 'string') {
//     try {
//       updateData.availableDates = JSON.parse(updateData.availableDates);
//     } catch {
//       updateData.availableDates = [];
//     }
//   }
//   const listing = await ListingService.updateListing(id, userId, userRole, updateData);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Listing updated successfully",
//     data: listing
//   });
// });
// // Delete listing
// const deleteListing = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user._id;
//   const userRole = (req as any).user.role;
//   const { id } = req.params;
//   await ListingService.deleteListing(id, userId, userRole);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Listing deleted successfully",
//     data: null
//   });
// });
// // Get guide dashboard
// const getGuideDashboard = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   const result = await ListingService.getGuideDashboardData(guideId);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Guide dashboard data retrieved",
//     data: result
//   });
// });
// export const ListingController = {
//   createListing,
//   getListing,
//   searchListings,
//   getMyListings,
//   updateListing,
//   deleteListing,
//   getGuideDashboard
// };
// import { Request, Response } from "express";
// import httpStatus from "http-status-codes";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
// import listingService from "./listing.service";
// import { GuideService } from "./listing.service";
// import { UserRole } from "../users/user.interface";
// import AppError from "../../utils/AppError";
// import { uploadImages } from "../../../cloudinary";
// // Create listing
// // export const createListing = catchAsync(async (req: Request, res: Response) => {
// //   const guideId = (req as any).user._id;
// //   console.log('=== CREATE LISTING REQUEST START ===');
// //   console.log('Guide ID:', guideId);
// //   console.log('Full request body:', req.body);
// //   console.log('Images array:', req.body.images);
// //   console.log('Images type:', typeof req.body.images);
// //   console.log('Images length:', Array.isArray(req.body.images) ? req.body.images.length : 'N/A');
// //   console.log('=== CREATE LISTING REQUEST END ===');
// //   try {
// //     const listing = await listingService.createListing(req.body, guideId);
// //     sendResponse(res, {
// //       success: true,
// //       statusCode: httpStatus.CREATED,
// //       message: "Listing created successfully",
// //       data: listing
// //     });
// //   } catch (error: any) {
// //     console.error('CREATE LISTING CATCH ERROR:', error);
// //     throw error;
// //   }
// // });
// // export const createListing = catchAsync(async (req: Request, res: Response) => {
// //   const guideId = (req as any).user._id;
// //   // Parse form data
// //   let listingData = req.body;
// //   if (typeof req.body.data === 'string') {
// //     listingData = JSON.parse(req.body.data);
// //   }
// //   // Upload images to Cloudinary
// //   let imageUrls: string[] = [];
// //   if (req.files && Array.isArray(req.files) && req.files.length > 0) {
// //     imageUrls = await uploadImages(req.files as Express.Multer.File[]);
// //   } else if (listingData.images && Array.isArray(listingData.images)) {
// //     imageUrls = listingData.images;
// //   } else {
// //     throw new AppError(httpStatus.BAD_REQUEST, 'At least one image is required');
// //   }
// //   // Prepare final listing data
// //   const finalListingData = {
// //     ...listingData,
// //     images: imageUrls,
// //     location: {
// //       address: listingData.address,
// //       city: listingData.city,
// //       country: listingData.country
// //     }
// //   };
// //   const listing = await listingService.createListing(finalListingData, guideId);
// //   sendResponse(res, {
// //     success: true,
// //     statusCode: httpStatus.CREATED,
// //     message: "Listing created successfully",
// //     data: listing
// //   });
// // });
// export const createListing = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   console.log('=== CREATE LISTING REQUEST ===');
//   // Parse the request body
//   let listingData = req.body;
//   // If data is sent as string (from FormData)
//   if (typeof req.body.data === 'string') {
//     try {
//       listingData = JSON.parse(req.body.data);
//     } catch (e) {
//       console.error('Failed to parse listing data:', e);
//       throw new AppError(httpStatus.BAD_REQUEST, 'Invalid listing data format');
//     }
//   }
//   console.log('Listing data received:', {
//     title: listingData.title,
//     description: listingData.description?.substring(0, 50) + '...',
//     price: listingData.price,
//     durationHours: listingData.durationHours,
//     maxGroupSize: listingData.maxGroupSize,
//     meetingPoint: listingData.meetingPoint,
//     category: listingData.category,
//     address: listingData.address,
//     city: listingData.city,
//     country: listingData.country,
//     languages: listingData.languages,
//     imagesCount: listingData.images?.length || 0,
//     availableDates: listingData.availableDates
//   });
//   console.log('Files received:', req.files ? `${(req.files as any[]).length} files` : 'No files');
//   // Handle image uploads
//   let imageUrls: string[] = [];
//   if (req.files && Array.isArray(req.files) && req.files.length > 0) {
//     // Upload to Cloudinary
//     console.log('Uploading images to Cloudinary...');
//     // imageUrls = await uploadMultipleToCloudinary(req.files as Express.Multer.File[]);
//     imageUrls = await uploadImages(req.files as Express.Multer.File[]);
//     console.log('Images uploaded:', imageUrls.length);
//   } else if (listingData.images && Array.isArray(listingData.images) && listingData.images.length > 0) {
//     // If already URLs provided (for testing or if already uploaded)
//     imageUrls = listingData.images;
//     console.log('Using provided image URLs:', imageUrls.length);
//   } else {
//     throw new AppError(httpStatus.BAD_REQUEST, 'At least one image is required');
//   }
//   // Validate image count
//   if (imageUrls.length < 1 || imageUrls.length > 5) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Between 1 and 5 images are required');
//   }
//   // Prepare location object
//   const location = {
//     address: listingData.address || listingData.location?.address,
//     city: listingData.city || listingData.location?.city,
//     country: listingData.country || listingData.location?.country
//   };
//   // Validate location fields
//   if (!location.address || !location.city || !location.country) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Address, city and country are required');
//   }
//   // Prepare final listing data
//   const finalListingData = {
//     title: listingData.title,
//     description: listingData.description,
//     price: Number(listingData.price),
//     durationHours: Number(listingData.durationHours),
//     maxGroupSize: Number(listingData.maxGroupSize),
//     meetingPoint: listingData.meetingPoint,
//     category: listingData.category,
//     languages: listingData.languages || ['English'],
//     images: imageUrls,
//     location: location,
//     availableDates: listingData.availableDates || []
//   };
//   console.log('Creating listing with data:', {
//     ...finalListingData,
//     images: `${finalListingData.images.length} images`
//   });
//   const listing = await listingService.createListing(finalListingData, guideId);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Listing created successfully",
//     data: listing
//   });
// });
// // Get listing by ID
// export const getListing = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const listing = await listingService.getListingById(id);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Listing retrieved successfully",
//     data: listing
//   });
// });
// // Search listings
// export const searchListings = catchAsync(async (req: Request, res: Response) => {
//   const { page = 1, limit = 12, ...filters } = req.query;
//   const result = await listingService.searchListings(
//     filters as any,
//     parseInt(page as string),
//     parseInt(limit as string)
//   );
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Listings retrieved successfully",
//     data: result.data,
//     meta: result.meta
//   });
// });
// // Get guide's listings
// export const getMyListings = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   const listings = await listingService.getListingsByGuide(guideId);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Your listings retrieved successfully",
//     data: listings
//   });
// });
// // Update listing
// export const updateListing = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user._id;
//   const userRole = (req as any).user.role;
//   const { id } = req.params;
//   const listing = await listingService.updateListing(id, userId, userRole, req.body);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Listing updated successfully",
//     data: listing
//   });
// });
// // Delete listing
// export const deleteListing = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user._id;
//   const userRole = (req as any).user.role;
//   const { id } = req.params;
//   await listingService.deleteListing(id, userId, userRole);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Listing deleted successfully",
//     data: null
//   });
// });
// // Get guide dashboard
// export const getGuideDashboard = catchAsync(async (req: Request, res: Response) => {
//   const guideId = (req as any).user._id;
//   const result = await GuideService.getGuideDashboardData(guideId);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Guide dashboard data retrieved",
//     data: result,
//   });
// });
// // Export controller
// export const ListingController = {
//   createListing,
//   getListing,
//   searchListings,
//   getMyListings,
//   updateListing,
//   deleteListing,
//   getGuideDashboard
// };
