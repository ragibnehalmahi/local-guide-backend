// backend/src/utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: any): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'local-guide-profiles',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};