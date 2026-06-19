/* eslint-disable @typescript-eslint/no-explicit-any */
//local-guide-backend\src\app\utils\catchAsync.ts     

import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Catch async errors wrapper
const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
      next(error);
    });
  };
};

export default catchAsync;