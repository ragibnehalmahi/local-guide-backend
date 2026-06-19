//local-guide-backend\src\app\middlewares\globalErrorHandler.ts     

import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";


  if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON format";
  }


  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID: ${err.value}`;
  }


  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }


  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = Object.values(err.errors).map((e: any) => e.message);
    message = errors.join(". ");
  }


  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }


  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }


  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }


  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,

    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default globalErrorHandler;
