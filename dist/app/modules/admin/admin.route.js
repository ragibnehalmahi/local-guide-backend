"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRouter = void 0;
// backend/src/modules/admin/admin.route.ts
const express_1 = __importDefault(require("express"));
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const AdminController = __importStar(require("./admin.controller"));
const router = express_1.default.Router();
// All admin routes require ADMIN role
router.use((0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN));
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
exports.AdminRouter = router;
