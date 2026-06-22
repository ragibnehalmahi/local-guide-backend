// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import router from "./app/routes";
import notFoundHandler from "./app/middlewares/notFoundHandler";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // ============ CORS ============
  const allowedOrigins = [
    'http://localhost:3000',
    'https://local-guide-frontend-assignment.vercel.app',
     
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log('❌ CORS blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,  
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(morgan("dev"));
  app.use(cookieParser());

  // ============ Routes ============
  app.use("/api/v1/", router);

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Not found handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(globalErrorHandler);

  return app;
};

export default createApp;
