//local-guide-backend\src\app\modules\listings\listing.interface.ts 

import { Types } from "mongoose";

export enum ListingCategory {
  FOOD = "food",
  HISTORY = "history",
  ART = "art",
  ADVENTURE = "adventure",
  NIGHTLIFE = "nightlife",
  SHOPPING = "shopping",
  PHOTOGRAPHY = "photography",
  NATURE = "nature"
}

export interface IListingLocation {
  address: string;
  city: string;
  country: string;
}

export interface IListing {
  _id?: Types.ObjectId;
  title: string;
  slug?: string;           // ✅ SEO-friendly URL (new)
  description: string;
  price: number;
  durationHours: number;
  maxGroupSize: number;
  meetingPoint: string;
  languages: string[];
  category: ListingCategory;
  images: string[];         // Cloudinary URLs
  location: IListingLocation;
  guide: Types.ObjectId;
  active: boolean;
  availableDates: Date[];
  createdAt?: Date;
  updatedAt?: Date;
}

