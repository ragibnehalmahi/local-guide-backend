"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingCategory = void 0;
var ListingCategory;
(function (ListingCategory) {
    ListingCategory["FOOD"] = "food";
    ListingCategory["HISTORY"] = "history";
    ListingCategory["ART"] = "art";
    ListingCategory["ADVENTURE"] = "adventure";
    ListingCategory["NIGHTLIFE"] = "nightlife";
    ListingCategory["SHOPPING"] = "shopping";
    ListingCategory["PHOTOGRAPHY"] = "photography";
    ListingCategory["NATURE"] = "nature";
})(ListingCategory || (exports.ListingCategory = ListingCategory = {}));
// import { Types } from "mongoose";
// export enum ListingCategory {
//   FOOD = "food",
//   HISTORY = "history",
//   ART = "art",
//   ADVENTURE = "adventure",
//   NIGHTLIFE = "nightlife",
//   SHOPPING = "shopping",
//   PHOTOGRAPHY = "photography",
//   NATURE = "nature"
// }
// export interface IListingLocation {
//   address: string;
//   city: string;
//   country: string;
// }
// export interface IListing {
//   id?: Types.ObjectId;
//   title: string;
//   description: string;
//   price: number;
//   durationHours: number;
//   maxGroupSize: number;
//   meetingPoint: string;
//   languages: string[];
//   category: ListingCategory;
//   images: string[];
//   location: IListingLocation;
//   guide: Types.ObjectId;
//   active: boolean;
//   availableDates: Date[];  // Simple available dates (no complex schedule)
//   createdAt?: Date;
//   updatedAt?: Date;
//   status: 'pending' | 'approved' | 'rejected';
//   isFeatured: boolean;
// }
