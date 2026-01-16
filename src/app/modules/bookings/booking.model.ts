import { Schema, model, Document } from "mongoose";
import { IBooking, BookingStatus, PaymentStatus } from "./booking.interface";

export type BookingDocument = Document & IBooking;

const BookingSchema = new Schema<BookingDocument>(
  {
    listing: { 
      type: Schema.Types.ObjectId, 
      ref: "Listing", 
      required: true,
      index: true
    },
    guide: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    tourist: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    date: { 
      type: Date, 
      required: true 
    },
    guestCount: { 
      type: Number, 
      required: true,
      min: 1,
      max: 20
    },
    status: { 
      type: String, 
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING
    },
    totalPrice: { 
      type: Number, 
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    }
  },
  {
    timestamps: true
  }
);

BookingSchema.index({ tourist: 1, status: 1 });
BookingSchema.index({ guide: 1, status: 1 });
BookingSchema.index({ listing: 1, date: 1 });


export {BookingStatus, PaymentStatus};
export const Booking = model<BookingDocument>("Booking", BookingSchema);