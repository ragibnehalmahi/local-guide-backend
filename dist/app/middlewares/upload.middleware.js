"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = void 0;
// backend/src/middlewares/upload.middleware.ts
const multer_1 = __importDefault(require("multer"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Only image files are allowed'), false);
    }
};
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 5);
