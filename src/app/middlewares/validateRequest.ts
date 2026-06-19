// src/middlewares/validateRequest.ts
import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError } from "zod";
import AppError from "../utils/AppError";
import httpStatus from "http-status-codes";


const validateRequest = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (req.body.data) {
        try {
          req.body = JSON.parse(req.body.data);
        } catch (err) {
          throw new AppError(httpStatus.BAD_REQUEST, "Invalid JSON in 'data' field");
        }
      }


      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        let errorMessage = firstIssue.message;


        if (firstIssue.path && firstIssue.path.length > 0) {
          let fieldPath = firstIssue.path;


          if (fieldPath.length > 1 &&
            (fieldPath[0] === 'body' || fieldPath[0] === 'query' || fieldPath[0] === 'params')) {
            fieldPath = fieldPath.slice(1);
          }

          const fieldName = fieldPath.join('.');
          errorMessage = `Invalid input in field '${fieldName}': ${firstIssue.message}`;
        }

        next(new AppError(httpStatus.BAD_REQUEST, errorMessage));
      } else {
        next(error);
      }
    }
  };
};


export default validateRequest;


