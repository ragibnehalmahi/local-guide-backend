import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface IPayment {
  booking: Types.ObjectId;
  tourist: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  transactionId: string;  // For SSLCommerz
  createdAt?: Date;
  updatedAt?: Date;
}