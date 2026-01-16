import { Types } from "mongoose";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
    FAILED = "FAILED",
}

// export interface IBooking {
//   _id?: Types.ObjectId;
//   listing: Types.ObjectId;
//   guide: Types.ObjectId;
//   tourist: Types.ObjectId;
//   date: Date;
//   guestCount: number;
//   status: BookingStatus;
//   totalPrice: number;
//   paymentStatus: PaymentStatus;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
export interface IBooking {
  _id?: Types.ObjectId;
  listing: Types.ObjectId;
  guide: Types.ObjectId;
  tourist: Types.ObjectId;
  toureTitle?: string;
  date: Date;
  guestCount: number;
  status: BookingStatus;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  transactionId?: string;  
  createdAt?: Date;
  updatedAt?: Date;
}