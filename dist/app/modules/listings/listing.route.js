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
// Create listing
router.post("/create", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), listing_controller_1.ListingController.createListing);
// Get my listings
router.get("/guide/my-listings", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE), listing_controller_1.ListingController.getMyListings);
// Update listing
router.patch("/:id", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), listing_controller_1.ListingController.updateListing);
// Delete listing
router.delete("/:id", (0, authGuard_1.authGuard)(user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), listing_controller_1.ListingController.deleteListing);
// Get listing by ID (must be at the end to prevent catching static paths)
router.get("/:id", listing_controller_1.ListingController.getListing);
exports.ListingRouter = router;
