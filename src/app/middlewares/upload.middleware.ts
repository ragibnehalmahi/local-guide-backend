// backend/src/middlewares/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import AppError from '../utils/AppError';
import httpStatus from 'http-status-codes';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(httpStatus.BAD_REQUEST, 'Only image files are allowed'), false);
  }
};

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 5);