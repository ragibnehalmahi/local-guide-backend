import { Schema, model, Document } from "mongoose";
import { IListing, IListingLocation, ListingCategory } from "./listing.interface";

export type ListingDocument = Document & IListing;

const LocationSchema = new Schema<IListingLocation>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
);

const ListingSchema = new Schema<ListingDocument>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: 5,
      maxlength: 100
    },
    description: { 
      type: String, 
      required: true,
      minlength: 20,
      maxlength: 1000
    },
    price: { 
      type: Number, 
      required: true,
      min: 1
    },
    durationHours: { 
      type: Number,
      required: true,
      min: 1,
      max: 24
    },
    maxGroupSize: { 
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    meetingPoint: { 
      type: String, 
      required: true,
      maxlength: 200
    },
    languages: [{ 
      type: String,
      required: true
    }],
    category: { 
      type: String, 
      enum: Object.values(ListingCategory),
      required: true
    },
    // images: [{ 
    //   type: String,
    //   validate: {
    //     validator: (images: string[]) => images.length <= 5,
    //     message: "Cannot upload more than 5 images"
    //   }
    // }],
    location: { 
      type: LocationSchema, 
      required: true 
    },
    guide: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    active: { 
      type: Boolean, 
      default: true 
    },
    availableDates: [{ 
      type: Date,
      default: []
    }]
  },
  {
    timestamps: true
  }
);

// Indexes
ListingSchema.index({ guide: 1, active: 1 });
ListingSchema.index({ category: 1, active: 1 });
ListingSchema.index({ "location.city": 1, active: 1 });

export const Listing = model<ListingDocument>("Listing", ListingSchema);