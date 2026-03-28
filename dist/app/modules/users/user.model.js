"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
// Sub-schemas
const CoordinatesSchema = new mongoose_1.Schema({
    lat: { type: Number },
    lng: { type: Number },
}, { _id: false });
const UserLocationSchema = new mongoose_1.Schema({
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    coordinates: CoordinatesSchema,
}, { _id: false });
const AuthProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
}, { _id: false });
// Main User Schema
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    profilePicture: { type: String },
    bio: { type: String, maxlength: 500 },
    languages: [{ type: String }],
    role: {
        type: String,
        enum: Object.values(user_interface_1.UserRole),
        default: user_interface_1.UserRole.TOURIST,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(user_interface_1.UserStatus),
        default: user_interface_1.UserStatus.ACTIVE,
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
    wishlist: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Tour" }],
    // Common
    authProviders: { type: [AuthProviderSchema], default: [] },
    location: { type: UserLocationSchema },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform(doc, ret) {
            // TypeScript fix for "operand of delete must be optional"
            delete ret.password;
            return ret;
        },
    },
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
