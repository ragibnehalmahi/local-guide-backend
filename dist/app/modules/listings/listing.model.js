"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const mongoose_1 = require("mongoose");
const listing_interface_1 = require("./listing.interface");
const LocationSchema = new mongoose_1.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });
const ListingSchema = new mongoose_1.Schema({
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
        enum: Object.values(listing_interface_1.ListingCategory),
        required: true
    },
    // Simple images array without extra validation to prevent Mongoose errors
    images: [{
            type: String,
            required: true
        }],
    location: {
        type: LocationSchema,
        required: true
    },
    guide: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
// Indexes
ListingSchema.index({ guide: 1, active: 1 });
ListingSchema.index({ category: 1, active: 1 });
ListingSchema.index({ "location.city": 1, active: 1 });
exports.Listing = (0, mongoose_1.model)("Listing", ListingSchema);
