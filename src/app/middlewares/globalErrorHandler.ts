import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";

  // Handle invalid JSON (Syntax Error)
  if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON format";
  }

  // Handle Mongoose Cast Error (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = Object.values(err.errors).map((e: any) => e.message);
    message = errors.join(". ");
  }

  // JWT invalid token
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // If it's an AppError → use provided status & message
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Final Response
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    // stack only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default globalErrorHandler;
