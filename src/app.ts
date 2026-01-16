// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import router from "./app/routes";
 
const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );
 app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  // Logging
  app.use(morgan("dev"));

  // Cookies
  app.use(cookieParser());

   
  // app.use(
  //   "/api/payments/webhook",
  //   express.raw({ type: "application/json" }),
  //   (req: Request, res: Response, next: NextFunction) => {
      
  //     next();
  //   }
  // );

   

  // Mount main api routes (this should include /api/payments except webhook)
  app.use("/api/v1/", router);

  // If you prefer to mount payments router separately (ensures webhook path handled above)
  // app.use("/api/payments", PaymentRoutes);

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // // Not found handler
  // app.use(notFoundHandler);

  // // Global error handler
  // app.use(globalErrorHandler);

  return app;
};

export default createApp;
