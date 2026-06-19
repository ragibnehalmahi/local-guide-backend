//local-guide-backend\src\app\config\cloudinary.config.ts   

import { v2 as cloudinary } from "cloudinary";
import AppError from "../errorHelpers/AppError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        // Extract public_id from URL
        const regex = /\/v\d+\/(.+)\./;
        const match = url.match(regex);

        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId);
            console.log(`✅ Image deleted: ${publicId}`);
        }
    } catch (error: any) {
        throw new AppError(500, "Failed to delete image from Cloudinary");
    }
};

export const cloudinaryUpload = cloudinary;


