"use strict";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { cloudinaryUpload } from "./cloudinary.config";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinaryUpload,
//     params: {
//         public_id: (req, file) => {
//             // My Special.Image#!@.png => 4545adsfsadf-45324263452-my-image.png
//             // My Special.Image#!@.png => [My Special, Image#!@, png]
//             const fileName = file.originalname
//                 .toLowerCase()
//                 .replace(/\s+/g, "-") // empty space remove replace with dash
//                 .replace(/\./g, "-")
//                 // eslint-disable-next-line no-useless-escape
//                 .replace(/[^a-z0-9\-\.]/g, "") // non alpha numeric - !@#$
//             const extension = file.originalname.split(".").pop()
//             // binary -> 0,1 hexa decimal -> 0-9 A-F base 36 -> 0-9 a-z
//             // 0.2312345121 -> "0.hedfa674338sasfamx" -> 
//             //452384772534
//             const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName + "." + extension
//             return uniqueFileName
//         }
//     }
// })
// export const multerUpload = multer({ storage: storage })
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = require("./cloudinary.config");
// Cloudinary storage configuration
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinaryUpload,
    params: async (req, file) => {
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
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'), false);
    }
};
// Multer upload middleware
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter
});
// Export middleware functions
exports.multerUpload = {
    single: (fieldName) => upload.single(fieldName),
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    fields: (fields) => upload.fields(fields),
    none: () => upload.none(),
    any: () => upload.any()
};
