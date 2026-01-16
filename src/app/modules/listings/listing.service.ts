import httpStatus from "http-status-codes";
import { IListing, ListingCategory } from "./listing.interface";
import { Listing } from "./listing.model";
import AppError from "../../utils/AppError";
import { User } from "../users/user.model";
import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
import { Review } from "../reviews/review.model";
import { UserRole } from "../users/user.interface";

interface CreateListingPayload extends Omit<IListing, "guide"> {}

interface SearchFilters {
  city?: string;
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
}

class ListingService {
// listing.service.ts
async createListing(payload: CreateListingPayload, guideId: string): Promise<IListing> {
  const guide = await User.findById(guideId);
  if (!guide || guide.role !== "guide") {
    throw new AppError(httpStatus.FORBIDDEN, "Only guides can create listings");
  }

  const existingListing = await Listing.findOne({
    title: payload.title,
    guide: guideId
  });
  if (existingListing) {
    throw new AppError(httpStatus.CONFLICT, "You already have a listing with this title");
  }

  // 🔹 Type casting with lean() to get plain object
  const listing = await Listing.create({
    ...payload,
    guide: guideId
  });

  // Convert to plain object and cast to IListing
  return listing.toObject() as IListing;
}

  async getListingById(id: string): Promise<IListing> {
    const listing = await Listing.findById(id)
      .populate("guide", "name email profilePicture");

    if (!listing || !listing.active) {
      throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    }

    return listing;
  }

  async searchListings(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 12
  ): Promise<{ data: IListing[]; meta: any }> {
    const query: any = { active: true };
    
    if (filters.city) {
      query["location.city"] = { $regex: filters.city, $options: "i" };
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    const skip = (page - 1) * limit;
    
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("guide", "name profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(query)
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

  async getListingsByGuide(guideId: string): Promise<IListing[]> {
    const listings = await Listing.find({ guide: guideId, active: true })
      .sort({ createdAt: -1 });

    return listings;
  }

  async updateListing(
    listingId: string,
    guideId: string,
    payload: Partial<IListing>
  ): Promise<IListing> {
    const listing = await Listing.findById(listingId);
    
    if (!listing || listing.guide.toString() !== guideId) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    Object.assign(listing, payload);
    await listing.save();

    return listing;
  }

  // async deleteListing(listingId: string, guideId: string): Promise<void> {
  //   const listing = await Listing.findById(listingId);
    
  //   if (!listing || listing.guide.toString() !== guideId) {
  //     throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  //   }

  //   listing.active = false;
  //   await listing.save();
  // }
  async deleteListing(listingId: string, userId: string, userRole: string): Promise<void> {
  const listing = await Listing.findById(listingId);
  
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // If admin, allow delete
  if (userRole === UserRole.ADMIN) {
    await Listing.findByIdAndDelete(listingId);
    return;
  }

  // If guide, check ownership
  if (listing.guide.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  }

  listing.active = false;
  await listing.save();
}

 
}

export default new ListingService();
export class GuideService {
  static async getGuideDashboardData(guideId: string) {
    // Get active listings count
    const totalListings = await Listing.countDocuments({ 
      guide: guideId, 
      active: true 
    });

    // Get total bookings count
    const totalBookings = await Booking.countDocuments({ 
      guide: guideId 
    });

    // Get total earnings from completed and paid bookings
    const earningsResult = await Booking.aggregate([
      { 
        $match: { 
          guide: guideId,
          status: BookingStatus.COMPLETED,
          paymentStatus: PaymentStatus.PAID
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
    const reviews = await Review.find({ guide: guideId });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Get pending bookings
    const pendingBookings = await Booking.countDocuments({ 
      guide: guideId, 
      status: BookingStatus.PENDING 
    });

    // Get upcoming tours (confirmed bookings in future)
    const upcomingTours = await Booking.countDocuments({ 
      guide: guideId, 
      status: BookingStatus.CONFIRMED,
      date: { $gte: new Date() }
    });

    // Get recent bookings (last 5)
    const recentBookings = await Booking.find({ guide: guideId })
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