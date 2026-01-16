import { Types } from "mongoose";

export interface IReview {
  tourist: Types.ObjectId;
  guide: Types.ObjectId;
  booking: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}