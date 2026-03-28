"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
// backend/src/services/cloudinary.service.ts
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
const AppError_1 = __importDefault(require("./app/utils/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadImages = async (files) => {
    try {
        const uploadPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'local-guide/listings',
                    resource_type: 'auto',
                    transformation: [{ width: 800, height: 600, crop: 'limit' }]
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result?.secure_url || '');
                });
                streamifier_1.default.createReadStream(file.buffer).pipe(uploadStream);
            });
        });
        return await Promise.all(uploadPromises);
    }
    catch (error) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, 'Failed to upload images');
    }
};
exports.uploadImages = uploadImages;
