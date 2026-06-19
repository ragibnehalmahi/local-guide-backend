"use strict";
//local-guide-backend\src\app\modules\listings\listing.controller.ts
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
    const incomingData = req.body.data ? (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data) : req.body;
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
