//local-guide-backend\src\app\modules\payments\payment.validation.ts    

import { z } from "zod";

export const initPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required")
  })
});