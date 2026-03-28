// backend/src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import AppError from './app/utils/AppError';  
import httpStatus from 'http-status-codes';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImages = async (files: Express.Multer.File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'local-guide/listings',
            resource_type: 'auto',
            transformation: [{ width: 800, height: 600, crop: 'limit' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || '');
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload images');
  }
};