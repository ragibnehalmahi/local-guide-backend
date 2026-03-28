// src/middlewares/validateRequest.ts
import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError } from "zod";
import AppError from "../utils/AppError";
import httpStatus from "http-status-codes";

/**
 * Middleware to validate request body against a Zod schema.
 * @param schema The Zod schema object to validate the request body against.
 */
const validateRequest = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ Handle multipart/form-data where JSON is in 'data' field
      if (req.body.data) {
        try {
          req.body = JSON.parse(req.body.data);
        } catch (err) {
          throw new AppError(httpStatus.BAD_REQUEST, "Invalid JSON in 'data' field");
        }
      }

      // Parse the request body against the schema
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
        
        // Add field path to error message
        if (firstIssue.path && firstIssue.path.length > 0) {
          let fieldPath = firstIssue.path;
          
          // Remove 'body', 'query', or 'params' from path for cleaner messages
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

// ✅ Default export - এইটা গুরুত্বপূর্ণ!
export default validateRequest;


// import { NextFunction, Request, Response } from "express"
// import { ZodObject } from "zod"

// export const validateRequest = (zodSchema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // req.body =JSON.parse(req.body.data || {}) || req.body
//         if (req.body.data) {
//             req.body = JSON.parse(req.body.data)
//         }
//         req.body = await zodSchema.parseAsync(req.body)
//         next()
//     } catch (error) {
//         next(error)
//     }
// }


// import { ZodSchema, ZodError, z } from "zod";
// import { Request, Response, NextFunction } from "express";
// import AppError from "../utils/AppError";
// import httpStatus from "http-status-codes";

// /**
//  * Middleware to validate request body against a Zod schema.
//  * @param schema The Zod schema object to validate the request body against.
//  */
// const validateRequest = (schema: ZodSchema) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // FIX: Schema-Middleware Mismatch Resolution
//       // যদি স্কিমাটি { body: z.object({...}) } প্যাটার্ন ব্যবহার করে,
//       // তবে parseAsync-এ রুট অবজেক্টের মধ্যে body, query, params পাঠানো আবশ্যক।
//       const validationTarget = {
//           body: req.body || {}, // Ensure Zod receives at least {} for the body property
//           query: req.query,
//           params: req.params,
//       };

//       await schema.parseAsync(validationTarget); 
//       next();
//     } catch (error: unknown) {
//       if (error instanceof ZodError) {
//         const firstIssue = error.issues[0];
//         let errorMessage = firstIssue.message;
//         
//         // Add field path to error message if available and simplify the path for client display.
//         if (firstIssue.path && firstIssue.path.length > 0) {
//             // FIX: Explicit type annotation removed to resolve the PropertyKey/symbol assignment error (ts(2322)).
//             let fieldPath = firstIssue.path; 

//             // যদি path-এর প্রথম সেগমেন্টটি 'body', 'query', বা 'params' হয় 
//             // এবং এর পরে আরও সেগমেন্ট থাকে, তবে প্রথম সেগমেন্টটি বাদ দিন। 
//             // এর ফলে error message-এ 'body.title' না এসে শুধুমাত্র 'title' আসবে।
//             if (fieldPath.length > 1 && (fieldPath[0] === 'body' || fieldPath[0] === 'query' || fieldPath[0] === 'params')) {
//                 fieldPath = fieldPath.slice(1);
//             }

//           const fieldName = fieldPath.join('.');
//           errorMessage = `Invalid input in field '${fieldName}': ${firstIssue.message}`;
//         }
//         
//         throw new AppError(httpStatus.BAD_REQUEST, errorMessage);
//       }
//       
//       // For other unexpected errors
//       throw error;
//     }
//   };
// };

// export default validateRequest;