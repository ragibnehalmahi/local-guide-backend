"use strict";
//local-guide-backend\src\app\modules\listings\listing.service.ts   
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const listing_model_1 = require("./listing.model");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const user_model_1 = require("../users/user.model");
const booking_model_1 = require("../bookings/booking.model");
const review_model_1 = require("../reviews/review.model");
const user_interface_1 = require("../users/user.interface");
class ListingService {
    // ============ CREATE LISTING ============
    static async createListing(payload, guideId) {
        const guide = await user_model_1.User.findById(guideId);
        if (!guide || guide.role !== "guide") {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only guides can create listings");
        }
        // Check for duplicate title
        const existingListing = await listing_model_1.Listing.findOne({
            title: payload.title,
            guide: guideId
        });
        if (existingListing) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "You already have a listing with this title");
        }
        // Validate images array
        if (!payload.images || payload.images.length === 0) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "At least one image is required");
        }
        if (payload.images.length > 10) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Maximum 10 images allowed");
        }
        // Validate location
        if (!payload.location?.address || !payload.location?.city || !payload.location?.country) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Address, city and country are required");
        }
        // Validate available dates
        if (!payload.availableDates || payload.availableDates.length === 0) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "At least one available date is required");
        }
        // Create listing
        const listing = await listing_model_1.Listing.create({
            ...payload,
            guide: guideId,
            active: true
        });
        return listing.toObject();
    }
    // ============ GET LISTING BY ID ============
    static async getListingById(id) {
        const listing = await listing_model_1.Listing.findById(id)
            .populate("guide", "name email profilePicture languages rating");
        if (!listing) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found");
        }
        return listing;
    }
    // ============ SEARCH LISTINGS ============
    static async searchListings(filters, page = 1, limit = 12) {
        const query = {};
        // Default to active only unless includeInactive=true is passed
        if (filters.includeInactive !== "true") {
            query.active = true;
        }
        // Search by city
        if (filters.city) {
            query["location.city"] = { $regex: filters.city, $options: "i" };
        }
        // Filter by category
        if (filters.category) {
            query.category = filters.category;
        }
        // Filter by price range
        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice)
                query.price.$gte = Number(filters.minPrice);
            if (filters.maxPrice)
                query.price.$lte = Number(filters.maxPrice);
        }
        // Filter by language
        if (filters.language) {
            query.languages = { $in: [filters.language] };
        }
        // Search by title/description (searchTerm)
        if (filters.searchTerm) {
            query.$or = [
                { title: { $regex: filters.searchTerm, $options: "i" } },
                { description: { $regex: filters.searchTerm, $options: "i" } }
            ];
        }
        const skip = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            listing_model_1.Listing.find(query)
                .populate("guide", "name profilePicture rating")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            listing_model_1.Listing.countDocuments(query)
        ]);
        return {
            data: listings,
            meta: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    // ============ GET LISTINGS BY GUIDE ============
    static async getListingsByGuide(guideId) {
        const listings = await listing_model_1.Listing.find({ guide: guideId, active: true })
            .sort({ createdAt: -1 });
        return listings;
    }
    // ============ UPDATE LISTING ============
    static async updateListing(listingId, userId, userRole, payload) {
        const listing = await listing_model_1.Listing.findById(listingId);
        if (!listing) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found");
        }
        // Check authorization
        if (userRole !== user_interface_1.UserRole.ADMIN && listing.guide.toString() !== userId) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized");
        }
        // Check duplicate title if updating title
        if (payload.title && payload.title !== listing.title) {
            const duplicateTitle = await listing_model_1.Listing.findOne({
                title: payload.title,
                guide: userId,
                _id: { $ne: listingId }
            });
            if (duplicateTitle) {
                throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "You already have a listing with this title");
            }
        }
        // Prepare update data
        const { location, ...otherData } = payload;
        const updateData = { ...otherData };
        // Flatten location if it exists
        if (location) {
            if (location.address)
                updateData["location.address"] = location.address;
            if (location.city)
                updateData["location.city"] = location.city;
            if (location.country)
                updateData["location.country"] = location.country;
        }
        // Admin can update all fields
        if (userRole === user_interface_1.UserRole.ADMIN) {
            const updatedListing = await listing_model_1.Listing.findByIdAndUpdate(listingId, updateData, { new: true, runValidators: true }).populate("guide", "name email");
            if (!updatedListing) {
                throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found after update");
            }
            return updatedListing;
        }
        // Guide can update allowed fields
        const updatedListing = await listing_model_1.Listing.findByIdAndUpdate(listingId, updateData, { new: true, runValidators: true }).populate("guide", "name email");
        if (!updatedListing) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found after update");
        }
        return updatedListing;
    }
    // ============ DELETE LISTING ============
    static async deleteListing(listingId, userId, userRole) {
        const listing = await listing_model_1.Listing.findById(listingId);
        if (!listing) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Listing not found");
        }
        // Admin can delete any listing permanently
        if (userRole === user_interface_1.UserRole.ADMIN) {
            await listing_model_1.Listing.findByIdAndDelete(listingId);
            return;
        }
        // Guide can only soft delete their own listing
        if (listing.guide.toString() !== userId) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized");
        }
        // Soft delete (mark as inactive)
        listing.active = false;
        await listing.save();
    }
    // ============ GET GUIDE DASHBOARD DATA ============
    static async getGuideDashboardData(guideId) {
        // Get active listings count
        const totalListings = await listing_model_1.Listing.countDocuments({
            guide: guideId,
            active: true
        });
        // Get total bookings count
        const totalBookings = await booking_model_1.Booking.countDocuments({
            guide: guideId
        });
        // Get total earnings from completed and paid bookings
        const earningsResult = await booking_model_1.Booking.aggregate([
            {
                $match: {
                    guide: guideId,
                    status: booking_model_1.BookingStatus.COMPLETED,
                    paymentStatus: booking_model_1.PaymentStatus.PAID
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);
        const totalEarnings = earningsResult[0]?.total || 0;
        // Get average rating from reviews
        const reviews = await review_model_1.Review.find({ guide: guideId });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        // Get pending bookings
        const pendingBookings = await booking_model_1.Booking.countDocuments({
            guide: guideId,
            status: booking_model_1.BookingStatus.PENDING
        });
        // Get upcoming tours (confirmed bookings in future)
        const upcomingTours = await booking_model_1.Booking.countDocuments({
            guide: guideId,
            status: booking_model_1.BookingStatus.CONFIRMED,
            date: { $gte: new Date() }
        });
        // Get recent bookings (last 5)
        const recentBookings = await booking_model_1.Booking.find({ guide: guideId })
            .populate('tourist', 'name email profilePicture')
            .populate('listing', 'title')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        return {
            totalListings,
            totalBookings,
            totalEarnings,
            averageRating: parseFloat(averageRating.toFixed(1)),
            pendingBookings,
            upcomingTours,
            recentBookings: recentBookings.map(booking => ({
                _id: booking._id,
                listing: booking.listing,
                tourist: booking.tourist,
                date: booking.date,
                status: booking.status,
                totalPrice: booking.totalPrice,
            }))
        };
    }
}
exports.ListingService = ListingService;
