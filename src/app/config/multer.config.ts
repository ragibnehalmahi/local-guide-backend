//local-guide-backend\src\app\config\multer.config.ts       
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import { Request } from "express";

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (req: Request, file: Express.Multer.File) => {
        // Generate unique filename
        const fileName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/\./g, "-")
            .replace(/[^a-z0-9\-]/g, "");

        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;

        return {
            folder: "local-guide/listings",
            public_id: uniqueFileName,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            transformation: [{ width: 800, height: 600, crop: "limit" }]
        };
    }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!') as any, false);
    }
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter
});

// Export middleware functions
export const multerUpload = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fields: multer.Field[]) => upload.fields(fields),
    none: () => upload.none(),
    any: () => upload.any()
};