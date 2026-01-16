import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    tourist: { type: Schema.Types.ObjectId, ref: "User", required: true },
    guide: { type: Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = model<IReview>("Review", ReviewSchema);