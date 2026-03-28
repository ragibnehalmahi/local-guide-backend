"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config/config"));
let server;
const startServer = async () => {
    try {
        await mongoose_1.default.connect(config_1.default.DB_URL);
        console.log("MongoDB Connected Successfully! 🚀");
        const app = (0, app_1.default)(); // <<< FIXED
        server = app.listen(config_1.default.PORT, () => {
            console.log(`🔥 Server is running on port ${config_1.default.PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
    }
};
(async () => {
    await startServer();
})();
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received... Server shutting down..");
    if (server)
        server.close(() => process.exit(1));
});
process.on("SIGINT", () => {
    console.log("SIGINT signal received... Server shutting down..");
    if (server)
        server.close(() => process.exit(1));
});
process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected... Server shutting down..", err);
    if (server)
        server.close(() => process.exit(1));
});
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected... Server shutting down..", err);
    if (server)
        server.close(() => process.exit(1));
});
