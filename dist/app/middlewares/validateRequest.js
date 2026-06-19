"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            if (req.body.data) {
                try {
                    req.body = JSON.parse(req.body.data);
                }
                catch (err) {
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid JSON in 'data' field");
                }
            }
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
                next(new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, errorMessage));
            }
            else {
                next(error);
            }
        }
    };
};
exports.default = validateRequest;
