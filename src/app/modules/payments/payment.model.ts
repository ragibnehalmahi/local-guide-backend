import { Schema, model } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    tourist: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Payment = model("Payment", PaymentSchema);