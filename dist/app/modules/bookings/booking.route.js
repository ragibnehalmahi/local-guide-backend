"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const booking_validation_1 = require("./booking.validation");
const router = express_1.default.Router();
router.use((0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST, user_interface_1.UserRole.GUIDE));
router.post("/", (0, validateRequest_1.default)(booking_validation_1.createBookingSchema), booking_controller_1.BookingController.createBooking);
router.get("/my-bookings", booking_controller_1.BookingController.getMyBookings);
router.get("/tourist/completed", booking_controller_1.BookingController.getCompletedBookingsForTourist);
router.get("/guide-bookings", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), booking_controller_1.BookingController.getBookingsForGuide);
router.get("/:id", booking_controller_1.BookingController.getBookingById);
router.patch("/:id/confirm", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), booking_controller_1.BookingController.confirmBooking);
router.patch("/:id/decline", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), booking_controller_1.BookingController.declineBooking);
router.patch("/:id/cancel", booking_controller_1.BookingController.cancelBooking);
router.patch("/:id/complete", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), booking_controller_1.BookingController.completeBooking);
router.get("/all", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), // শুধু admin
booking_controller_1.BookingController.getAllBookingsForAdmin);
router.get("/stats", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), booking_controller_1.BookingControllers.getBookingStatsForAdmin);
exports.BookingRouter = router;
