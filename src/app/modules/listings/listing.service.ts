import httpStatus from "http-status-codes";
import { IListing, ListingCategory } from "./listing.interface";
import { Listing } from "./listing.model";
import AppError from "../../utils/AppError";
import { User } from "../users/user.model";
import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
import { Review } from "../reviews/review.model";
import { UserRole } from "../users/user.interface";

interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  durationHours: number;
  maxGroupSize: number;
  meetingPoint: string;
  languages: string[];
  category: ListingCategory;
  images: string[];
  location: {
    address: string;
    city: string;
    country: string;
  };
  availableDates: Date[];
}

interface SearchFilters {
  city?: string;
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  searchTerm?: string;
}

class ListingService {
  
  // ============ CREATE LISTING ============
  static async createListing(payload: CreateListingPayload, guideId: string): Promise<IListing> {
    const guide = await User.findById(guideId);
    if (!guide || guide.role !== "guide") {
      throw new AppError(httpStatus.FORBIDDEN, "Only guides can create listings");
    }

    // Check for duplicate title
    const existingListing = await Listing.findOne({
      title: payload.title,
      guide: guideId
    });
    
    if (existingListing) {
      throw new AppError(httpStatus.CONFLICT, "You already have a listing with this title");
    }

    // Validate images array
    if (!payload.images || payload.images.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "At least one image is required");
    }

    if (payload.images.length > 10) {
      throw new AppError(httpStatus.BAD_REQUEST, "Maximum 10 images allowed");
    }

    // Validate location
    if (!payload.location?.address || !payload.location?.city || !payload.location?.country) {
      throw new AppError(httpStatus.BAD_REQUEST, "Address, city and country are required");
    }

    // Validate available dates
    if (!payload.availableDates || payload.availableDates.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "At least one available date is required");
    }

    // Create listing
    const listing = await Listing.create({
      ...payload,
      guide: guideId,
      active: true
    });

    return listing.toObject() as IListing;
  }

  // ============ GET LISTING BY ID ============
  static async getListingById(id: string): Promise<IListing> {
    const listing = await Listing.findById(id)
      .populate("guide", "name email profilePicture languages rating");

    if (!listing) {
      throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    }

    return listing;
  }

  // ============ SEARCH LISTINGS ============
  static async searchListings(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 12
  ): Promise<{ data: IListing[]; meta: any }> {
    const query: any = { active: true };
    
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
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
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
      Listing.find(query)
        .populate("guide", "name profilePicture rating")
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

  // ============ GET LISTINGS BY GUIDE ============
  static async getListingsByGuide(guideId: string): Promise<IListing[]> {
    const listings = await Listing.find({ guide: guideId, active: true })
      .sort({ createdAt: -1 });

    return listings;
  }

  // ============ UPDATE LISTING ============
  static async updateListing(
    listingId: string,
    userId: string,
    userRole: string,
    payload: Partial<IListing>
  ): Promise<IListing> {
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    }

    // Check authorization
    if (userRole !== UserRole.ADMIN && listing.guide.toString() !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    // Check duplicate title if updating title
    if (payload.title && payload.title !== listing.title) {
      const duplicateTitle = await Listing.findOne({
        title: payload.title,
        guide: userId,
        _id: { $ne: listingId }
      });
      
      if (duplicateTitle) {
        throw new AppError(httpStatus.CONFLICT, "You already have a listing with this title");
      }
    }

    // Prepare update data
    const { location, ...otherData } = payload;
    const updateData: any = { ...otherData };

    // Flatten location if it exists
    if (location) {
      if (location.address) updateData["location.address"] = location.address;
      if (location.city) updateData["location.city"] = location.city;
      if (location.country) updateData["location.country"] = location.country;
    }

    // Admin can update all fields
    if (userRole === UserRole.ADMIN) {
      const updatedListing = await Listing.findByIdAndUpdate(
        listingId,
        updateData,
        { new: true, runValidators: true }
      ).populate("guide", "name email");
      
      if (!updatedListing) {
        throw new AppError(httpStatus.NOT_FOUND, "Listing not found after update");
      }
      return updatedListing;
    }

    // Guide can update allowed fields
    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      updateData,
      { new: true, runValidators: true }
    ).populate("guide", "name email");

    if (!updatedListing) {
      throw new AppError(httpStatus.NOT_FOUND, "Listing not found after update");
    }
    return updatedListing;
  }

  // ============ DELETE LISTING ============
  static async deleteListing(listingId: string, userId: string, userRole: string): Promise<void> {
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    }

    // Admin can delete any listing permanently
    if (userRole === UserRole.ADMIN) {
      await Listing.findByIdAndDelete(listingId);
      return;
    }

    // Guide can only soft delete their own listing
    if (listing.guide.toString() !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    // Soft delete (mark as inactive)
    listing.active = false;
    await listing.save();
  }

  // ============ GET GUIDE DASHBOARD DATA ============
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

// Export the class
export { ListingService };

// import httpStatus from "http-status-codes";
// import { IListing, ListingCategory } from "./listing.interface";
// import { Listing } from "./listing.model";
// import AppError from "../../utils/AppError";
// import { User } from "../users/user.model";
// import { Booking, BookingStatus, PaymentStatus } from "../bookings/booking.model";
// import { Review } from "../reviews/review.model";
// import { UserRole } from "../users/user.interface";

// interface CreateListingPayload {
//   title: string;
//   description: string;
//   price: number;
//   durationHours: number;
//   maxGroupSize: number;
//   meetingPoint: string;
//   languages: string[];
//   category: ListingCategory;
//   images: string[];
//   location: {
//     address: string;
//     city: string;
//     country: string;
//   };
//   availableDates: Date[];
// }

// interface SearchFilters {
//   city?: string;
//   category?: ListingCategory;
//   minPrice?: number;
//   maxPrice?: number;
// }

// class ListingService {
//   // Create listing
//   // async createListing(payload: CreateListingPayload, guideId: string): Promise<IListing> {
//   //   const guide = await User.findById(guideId);
//   //   if (!guide || guide.role !== "guide") {
//   //     throw new AppError(httpStatus.FORBIDDEN, "Only guides can create listings");
//   //   }

//   //   const existingListing = await Listing.findOne({
//   //     title: payload.title,
//   //     guide: guideId
//   //   });
//   //   if (existingListing) {
//   //     throw new AppError(httpStatus.CONFLICT, "You already have a listing with this title");
//   //   }

//   //   const listing = await Listing.create({
//   //     ...payload,
//   //     guide: guideId
//   //   });

//   //   return listing.toObject() as IListing;
//   // }
// async createListing(payload: CreateListingPayload, guideId: string): Promise<IListing> {
//     const guide = await User.findById(guideId);
//     if (!guide || guide.role !== "guide") {
//       throw new AppError(httpStatus.FORBIDDEN, "Only guides can create listings");
//     }

//     // Check for duplicate title
//     const existingListing = await Listing.findOne({
//       title: payload.title,
//       guide: guideId
//     });
    
//     if (existingListing) {
//       throw new AppError(httpStatus.CONFLICT, "You already have a listing with this title");
//     }

//     // Validate images array
//     if (!payload.images || payload.images.length === 0) {
//       throw new AppError(httpStatus.BAD_REQUEST, "At least one image is required");
//     }

//     if (payload.images.length > 5) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Maximum 5 images allowed");
//     }

//     // Validate location
//     if (!payload.location?.address || !payload.location?.city || !payload.location?.country) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Address, city and country are required");
//     }

//     // Validate available dates
//     if (!payload.availableDates || payload.availableDates.length === 0) {
//       throw new AppError(httpStatus.BAD_REQUEST, "At least one available date is required");
//     }

//     // Create listing
//     const listing = await Listing.create({
//       ...payload,
//       guide: guideId,
//       active: true
//     });

//     return listing.toObject() as IListing;
//   }

//   // Get listing by ID
//   async getListingById(id: string): Promise<IListing> {
//     const listing = await Listing.findById(id)
//       .populate("guide", "name email profilePicture");

//     if (!listing) {
//       throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
//     }

//     return listing;
//   }

//   // // Search listings
//   async searchListings(
//     filters: any,
//     page: number = 1,
//     limit: number = 12
//   ): Promise<{ data: IListing[]; meta: any }> {
//     const query: any = { active: true };
    
//     if (filters.city) {
//       query["location.city"] = { $regex: filters.city, $options: "i" };
//     }
    
//     if (filters.category) {
//       query.category = filters.category;
//     }
    
//     if (filters.minPrice || filters.maxPrice) {
//       query.price = {};
//       if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
//       if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
//     }
    
//     if (filters.language) {
//       query.languages = { $in: [filters.language] };
//     }

//     const skip = (page - 1) * limit;
    
//     const [listings, total] = await Promise.all([
//       Listing.find(query)
//         .populate("guide", "name profilePicture")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Listing.countDocuments(query)
//     ]);

//     return {
//       data: listings,
//       meta: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     };
//   }

//   // // Get listings by guide
//   async getListingsByGuide(guideId: string): Promise<IListing[]> {
//     const listings = await Listing.find({ guide: guideId })
//       .sort({ createdAt: -1 });

//     return listings;
//   }

//   // // Update listing
//   // async updateListing(
//   //   listingId: string,
//   //   userId: string,
//   //   userRole: string,
//   //   payload: Partial<IListing>
//   // ): Promise<IListing> {
//   //   const listing = await Listing.findById(listingId);
    
//   //   if (!listing) {
//   //     throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
//   //   }

//   //   // Check authorization
//   //   if (userRole !== 'admin' && listing.guide.toString() !== userId) {
//   //     throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
//   //   }

//   //   const updatedListing = await Listing.findByIdAndUpdate(
//   //     listingId,
//   //     payload,
//   //     { new: true, runValidators: true }
//   //   ).populate("guide", "name email");

//   //   return updatedListing!;
//   // }

//   // // Delete listing
//   // async deleteListing(listingId: string, userId: string, userRole: string): Promise<void> {
//   //   const listing = await Listing.findById(listingId);
    
//   //   if (!listing) {
//   //     throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
//   //   }

//   //   // Check authorization
//   //   if (userRole !== 'admin' && listing.guide.toString() !== userId) {
//   //     throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
//   //   }

//   //   // Soft delete
//   //   listing.active = false;
//   //   await listing.save();
//   // }
//   // // Get listing by ID
//   // async getListingById(id: string): Promise<IListing> {
//   //   const listing = await Listing.findById(id)
//   //     .populate("guide", "name email profilePicture");

//   //   if (!listing || !listing.active) {
//   //     throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
//   //   }

//   //   return listing;
//   // }

//   // // Search listings
//   // async searchListings(
//   //   filters: SearchFilters,
//   //   page: number = 1,
//   //   limit: number = 12
//   // ): Promise<{ data: IListing[]; meta: any }> {
//   //   const query: any = { active: true };
    
//   //   if (filters.city) {
//   //     query["location.city"] = { $regex: filters.city, $options: "i" };
//   //   }
    
//   //   if (filters.category) {
//   //     query.category = filters.category;
//   //   }
    
//   //   if (filters.minPrice || filters.maxPrice) {
//   //     query.price = {};
//   //     if (filters.minPrice) query.price.$gte = filters.minPrice;
//   //     if (filters.maxPrice) query.price.$lte = filters.maxPrice;
//   //   }

//   //   const skip = (page - 1) * limit;
    
//   //   const [listings, total] = await Promise.all([
//   //     Listing.find(query)
//   //       .populate("guide", "name profilePicture")
//   //       .sort({ createdAt: -1 })
//   //       .skip(skip)
//   //       .limit(limit),
//   //     Listing.countDocuments(query)
//   //   ]);

//   //   return {
//   //     data: listings,
//   //     meta: {
//   //       page,
//   //       limit,
//   //       total,
//   //       pages: Math.ceil(total / limit)
//   //     }
//   //   };
//   // }

//   // // Get listings by guide
//   // async getListingsByGuide(guideId: string): Promise<IListing[]> {
//   //   const listings = await Listing.find({ guide: guideId, active: true })
//   //     .sort({ createdAt: -1 });

//   //   return listings;
//   // }

//   // Delete listing (Admin or Guide)
//   async deleteListing(listingId: string, userId: string, userRole: string): Promise<void> {
//     const listing = await Listing.findById(listingId);
    
//     if (!listing) {
//       throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
//     }

//     // If admin, allow delete
//     if (userRole === UserRole.ADMIN) {
//       await Listing.findByIdAndDelete(listingId);
//       return;
//     }

//     // If guide, check ownership
//     if (listing.guide.toString() !== userId) {
//       throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
//     }

//     listing.active = false;
//     await listing.save();
//   }

//   // Update listing (Admin or Guide)
//   async updateListing(
//     listingId: string,
//     userId: string,
//     userRole: string,
//     payload: Partial<IListing>
//   ): Promise<IListing> {
//     const listing = await Listing.findById(listingId);
    
//     if (!listing) {
//       throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
//     }

//     // Admin can update any listing
//     if (userRole === UserRole.ADMIN) {
//       const updatedListing = await Listing.findByIdAndUpdate(
//         listingId,
//         payload,
//         { new: true, runValidators: true }
//       ).populate("guide", "name email");
      
//       return updatedListing!;
//     }

//     // Guide can only update their own listing
//     if (listing.guide.toString() !== userId) {
//       throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
//     }

//     // Guide cannot change admin-only fields
//     const { status, isFeatured, ...guideAllowedFields } = payload;
    
//     const updatedListing = await Listing.findByIdAndUpdate(
//       listingId,
//       guideAllowedFields,
//       { new: true, runValidators: true }
//     ).populate("guide", "name email");

//     return updatedListing!;
//   }
// }

// // Guide Service
// class GuideService {
//   static async getGuideDashboardData(guideId: string) {
//     // Get active listings count
//     const totalListings = await Listing.countDocuments({ 
//       guide: guideId, 
//       active: true 
//     });

//     // Get total bookings count
//     const totalBookings = await Booking.countDocuments({ 
//       guide: guideId 
//     });

//     // Get total earnings from completed and paid bookings
//     const earningsResult = await Booking.aggregate([
//       { 
//         $match: { 
//           guide: guideId,
//           status: BookingStatus.COMPLETED,
//           paymentStatus: PaymentStatus.PAID
//         } 
//       },
//       { 
//         $group: { 
//           _id: null, 
//           total: { $sum: "$totalPrice" } 
//         } 
//       }
//     ]);

//     const totalEarnings = earningsResult[0]?.total || 0;

//     // Get average rating from reviews
//     const reviews = await Review.find({ guide: guideId });
//     const averageRating = reviews.length > 0 
//       ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
//       : 0;

//     // Get pending bookings
//     const pendingBookings = await Booking.countDocuments({ 
//       guide: guideId, 
//       status: BookingStatus.PENDING 
//     });

//     // Get upcoming tours (confirmed bookings in future)
//     const upcomingTours = await Booking.countDocuments({ 
//       guide: guideId, 
//       status: BookingStatus.CONFIRMED,
//       date: { $gte: new Date() }
//     });

//     // Get recent bookings (last 5)
//     const recentBookings = await Booking.find({ guide: guideId })
//       .populate('tourist', 'name email profilePicture')
//       .populate('listing', 'title')
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();

//     return {
//       totalListings,
//       totalBookings,
//       totalEarnings,
//       averageRating: parseFloat(averageRating.toFixed(1)),
//       pendingBookings,
//       upcomingTours,
//       recentBookings: recentBookings.map(booking => ({
//         _id: booking._id,
//         listing: booking.listing,
//         tourist: booking.tourist,
//         date: booking.date,
//         status: booking.status,
//         totalPrice: booking.totalPrice,
//       }))
//     };
//   }
// }

// // Export instances
// const listingService = new ListingService();
// export default listingService;
// export { GuideService };