import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  TOURIST = "tourist",
  GUIDE = "guide"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED"
}

export interface IUserLocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IAuthProvider {
  provider: string;
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  languages: string[];
  role: UserRole;
  status?: UserStatus;
  isDeleted?: boolean;
  isVerified?: boolean;
  
  // Guide-specific fields
  expertise?: string[];
  dailyRate?: number;
  rating?: number;
  totalReviews?: number;
  yearsOfExperience?: number;
  availableDates?: Date[];
  
  // Tourist-specific fields
  travelPreferences?: string[];
  wishlist?: Types.ObjectId[];
  
  // Common
  authProviders?: IAuthProvider[];
  location?: IUserLocation;
  
  // Methods
  comparePassword?(candidatePassword: string): Promise<boolean>;
}