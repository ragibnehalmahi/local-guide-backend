"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./app/routes"));
const notFoundHandler_1 = __importDefault(require("./app/middlewares/notFoundHandler"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)());
    // ============ CORS ============
    const allowedOrigins = [
        'http://localhost:3000',
        'https://local-guide-frontend-assignment.vercel.app',
    ];
    app.use((0, cors_1.default)({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                console.log('❌ CORS blocked origin:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use((0, morgan_1.default)("dev"));
    app.use((0, cookie_parser_1.default)());
    // ============ Routes ============
    app.use("/api/v1/", routes_1.default);
    // Health check
    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    // Not found handler
    app.use(notFoundHandler_1.default);
    // Global error handler
    app.use(globalErrorHandler_1.default);
    return app;
};
exports.default = createApp;
