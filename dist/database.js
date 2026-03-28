"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    try {
        await mongoose_1.default.connect("mongodb+srv://ragibnehalmahi50:maPUGc9SVGfevxA6@cluster0.k7pv1lg.mongodb.net/local-guide?retryWrites=true&w=majority&appName=Cluster0");
        console.log('✅ MongoDB connected');
    }
    catch (err) {
        console.error('❌ MongoDB connection error', err);
        process.exit(1);
    }
}
