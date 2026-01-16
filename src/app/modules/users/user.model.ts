import { Schema, model, Document } from "mongoose";
import { IUser, IUserLocation, UserRole, UserStatus } from "./user.interface";

export type UserDocument = Document & IUser;

// Sub-schemas
const CoordinatesSchema = new Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const UserLocationSchema = new Schema<IUserLocation>(
  {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    coordinates: CoordinatesSchema,
  },
  { _id: false }
);

const AuthProviderSchema = new Schema(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false }
);

// Main User Schema
const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    phone: { type: String },
    profilePicture: { type: String },
    bio: { type: String, maxlength: 500 },
    languages: [{ type: String }],

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.TOURIST,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // Guide-specific fields
    expertise: [
      {
        type: String,
        enum: [
          "History",
          "Food",
          "Art",
          "Adventure",
          "Nightlife",
          "Shopping",
          "Photography",
          "Nature",
        ],
      },
    ],
    dailyRate: { type: Number, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    yearsOfExperience: { type: Number, default: 0 },
    availableDates: [{ type: Date }],

    // Tourist-specific
    travelPreferences: [{ type: String }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Tour" }],

    // Common
    authProviders: { type: [AuthProviderSchema], default: [] },
    location: { type: UserLocationSchema },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        // TypeScript fix for "operand of delete must be optional"
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

export const User = model<UserDocument>("User", UserSchema);
