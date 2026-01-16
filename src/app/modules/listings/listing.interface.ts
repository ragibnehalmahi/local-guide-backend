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
  id?: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  durationHours: number;
  maxGroupSize: number;
  meetingPoint: string;
  languages: string[];
  category: ListingCategory;
  images: string[];
  location: IListingLocation;
  guide: Types.ObjectId;
  active: boolean;
  availableDates: Date[];  // Simple available dates (no complex schedule)
  createdAt?: Date;
  updatedAt?: Date;
}