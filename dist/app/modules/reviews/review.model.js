"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    tourist: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    guide: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });
exports.Review = (0, mongoose_1.model)("Review", ReviewSchema);
