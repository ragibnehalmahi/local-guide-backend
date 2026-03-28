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
    // CORS
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    // Logging
    app.use((0, morgan_1.default)("dev"));
    // Cookies
    app.use((0, cookie_parser_1.default)());
    // app.use(
    //   "/api/payments/webhook",
    //   express.raw({ type: "application/json" }),
    //   (req: Request, res: Response, next: NextFunction) => {
    //     next();
    //   }
    // );
    // Mount main api routes (this should include /api/payments except webhook)
    app.use("/api/v1/", routes_1.default);
    // If you prefer to mount payments router separately (ensures webhook path handled above)
    // app.use("/api/payments", PaymentRoutes);
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
