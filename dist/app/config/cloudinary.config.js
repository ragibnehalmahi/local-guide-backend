"use strict";
//local-guide-backend\src\app\config\cloudinary.config.ts   
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUpload = exports.deleteImageFromCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const deleteImageFromCloudinary = async (url) => {
    try {
        // Extract public_id from URL
        const regex = /\/v\d+\/(.+)\./;
        const match = url.match(regex);
        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary_1.v2.uploader.destroy(publicId);
            console.log(`✅ Image deleted: ${publicId}`);
        }
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to delete image from Cloudinary");
    }
};
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
