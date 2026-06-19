"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
//local-guide-backend\src\app\utils\catchAsync.ts     
Object.defineProperty(exports, "__esModule", { value: true });
// Catch async errors wrapper
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            next(error);
        });
    };
};
exports.default = catchAsync;
