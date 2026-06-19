// backend/src/modules/admin/admin.route.ts
import express from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
import * as AdminController from "./admin.controller";

const router = express.Router();

// All admin routes require ADMIN role
router.use(authGuard(UserRole.ADMIN));

// ============ USER MANAGEMENT ============
router.get("/users", AdminController.getAllUsers);
router.get("/users/search", AdminController.searchUserByEmail);
router.patch("/users/:id/status", AdminController.updateUserStatus);
router.patch("/users/:id/role", AdminController.updateUserRole);
router.delete("/users/:id", AdminController.deleteUser);

// ============ LISTING MANAGEMENT ============
router.get("/listings", AdminController.getAllListings);
router.patch("/listings/:id", AdminController.updateListing);
router.delete("/listings/:id", AdminController.deleteListing);

// ============ BOOKING MANAGEMENT ============
router.get("/bookings", AdminController.getAllBookings);
router.get("/bookings/stats", AdminController.getBookingStats);
router.patch("/bookings/:id/status", AdminController.updateBookingStatus);
router.patch("/bookings/:id/payment-status", AdminController.updatePaymentStatus);

// ============ REVIEW MANAGEMENT ============
router.get("/reviews", AdminController.getAllReviews);
router.patch("/reviews/:id", AdminController.updateReview);
router.delete("/reviews/:id", AdminController.deleteReview);

export const AdminRouter = router;