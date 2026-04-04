
import express from "express";
import { BookingController, BookingControllers } from "./booking.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
import validateRequest from "../../middlewares/validateRequest";
import { createBookingSchema } from "./booking.validation";
 
const router = express.Router();

router.use(authGuard(UserRole.TOURIST, UserRole.GUIDE));

router.post("/", validateRequest(createBookingSchema), BookingController.createBooking);
router.get("/my-bookings", BookingController.getMyBookings);
router.get("/guide-bookings", authGuard(UserRole.GUIDE), BookingController.getBookingsForGuide);
router.get("/:id", BookingController.getBookingById);
router.patch("/:id/confirm", authGuard(UserRole.GUIDE), BookingController.confirmBooking);
router.patch("/:id/decline", authGuard(UserRole.GUIDE), BookingController.declineBooking);
router.patch("/:id/cancel", BookingController.cancelBooking);
router.patch("/:id/complete", authGuard(UserRole.GUIDE), BookingController.completeBooking);
router.get(
  "/all",
  authGuard(UserRole.ADMIN), // শুধু admin
  BookingController.getAllBookingsForAdmin
);

router.get(
  "/stats",
  authGuard(UserRole.ADMIN),
  BookingControllers.getBookingStatsForAdmin
);
export const BookingRouter = router;