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

// Create listing with image upload
// router.post(
//   "/",
//   authGuard(UserRole.GUIDE),
//   multerUpload.array("images", 5),
//   ListingController.createListing
// );
router.post(
  "/create",
  authGuard(UserRole.GUIDE),
  ListingController.createListing  // ✅ Multer সরিয়ে দিন
);
// Get my listings
router.get(
  "/guide/my-listings",
  authGuard(UserRole.GUIDE),
  ListingController.getMyListings
);

// Update listing with optional new images
router.patch(
  "/:id",
  authGuard(UserRole.GUIDE, UserRole.ADMIN),
  ListingController.updateListing  // ← Multer সরিয়ে দিন
);

// Delete listing
router.delete(
  "/:id",
  authGuard(UserRole.GUIDE, UserRole.ADMIN),
  ListingController.deleteListing
);

// Get listing by ID (must be at the end to prevent catching static paths like /guide/dashboard)
router.get("/:id", ListingController.getListing);

export const ListingRouter = router;





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