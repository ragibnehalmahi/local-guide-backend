import express from "express";
import { ListingController } from "./listing.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.get("/", ListingController.searchListings);

// ============ PROTECTED ROUTES ============

// Guide dashboard
router.get(
  "/guide/dashboard",
  authGuard(UserRole.GUIDE),
  ListingController.getGuideDashboard
);

// Create listing
router.post(
  "/create",
  authGuard(UserRole.GUIDE),
  ListingController.createListing
);

// Get my listings
router.get(
  "/guide/my-listings",
  authGuard(UserRole.GUIDE),
  ListingController.getMyListings
);

// Update listing
router.patch(
  "/:id",
  authGuard(UserRole.GUIDE, UserRole.ADMIN),
  ListingController.updateListing
);

// Delete listing
router.delete(
  "/:id",
  authGuard(UserRole.GUIDE, UserRole.ADMIN),
  ListingController.deleteListing
);

// Get listing by ID (must be at the end to prevent catching static paths)
router.get("/:id", ListingController.getListing);

export const ListingRouter = router;