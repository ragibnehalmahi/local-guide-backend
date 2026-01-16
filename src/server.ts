import { Server } from "http";
import mongoose from "mongoose";
import createApp from "./app";
import config from "./app/config/config";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(config.DB_URL);
    console.log("MongoDB Connected Successfully! 🚀");

    const app = createApp(); // <<< FIXED

    server = app.listen(config.PORT, () => {
      console.log(`🔥 Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

(async () => {
  await startServer();
})();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received... Server shutting down..");
  if (server) server.close(() => process.exit(1));
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received... Server shutting down..");
  if (server) server.close(() => process.exit(1));
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shutting down..", err);
  if (server) server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected... Server shutting down..", err);
  if (server) server.close(() => process.exit(1));
});
