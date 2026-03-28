"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingRouter = void 0;
const express_1 = __importDefault(require("express"));
const listing_controller_1 = require("./listing.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router();
// ============ PUBLIC ROUTES ============
router.get("/", listing_controller_1.ListingController.searchListings);
// ============ PROTECTED ROUTES ============
// Guide dashboard
router.get("/guide/dashboard", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), listing_controller_1.ListingController.getGuideDashboard);
// Create listing with image upload
// router.post(
//   "/",
//   authGuard(UserRole.GUIDE),
//   multerUpload.array("images", 5),
//   ListingController.createListing
// );
router.post("/create", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), listing_controller_1.ListingController.createListing // ✅ Multer সরিয়ে দিন
);
// Get my listings
router.get("/guide/my-listings", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), listing_controller_1.ListingController.getMyListings);
// Update listing with optional new images
router.patch("/:id", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), listing_controller_1.ListingController.updateListing // ← Multer সরিয়ে দিন
);
// Delete listing
router.delete("/:id", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), listing_controller_1.ListingController.deleteListing);
// Get listing by ID (must be at the end to prevent catching static paths like /guide/dashboard)
router.get("/:id", listing_controller_1.ListingController.getListing);
exports.ListingRouter = router;
// import express from "express";
// import { ListingController } from "./listing.controller";
// import { authGuard } from "../../middlewares/authGuard";
// import { UserRole } from "../users/user.interface";
// const router = express.Router();
// // Public routes
// router.get("/", ListingController.searchListings);
// router.get("/:id", ListingController.getListing);
// // Protected routes (Guide only)
// router.use(authGuard(UserRole.GUIDE));
// router.get("/dashboard", ListingController.getGuideDashboard);
// router.post("/", ListingController.createListing);
// router.get("/guide/my-listings", ListingController.getMyListings);
// router.patch("/:id",authGuard(UserRole.GUIDE,UserRole.ADMIN), ListingController.updateListing);
// router.delete("/:id", authGuard(UserRole.GUIDE,UserRole.ADMIN), ListingController.deleteListing);
// export const ListingRouter = router;
