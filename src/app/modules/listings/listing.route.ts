import express from "express";
import { ListingController } from "./listing.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";

const router = express.Router();

// Public routes
router.get("/", ListingController.searchListings);
router.get("/:id", ListingController.getListing);

// Protected routes (Guide only)
router.use(authGuard(UserRole.GUIDE));
router.get("/dashboard", ListingController.getGuideDashboard);
router.post("/", ListingController.createListing);
router.get("/guide/my-listings", ListingController.getMyListings);

router.patch("/:id", ListingController.updateListing);
router.delete("/:id",authGuard(UserRole.ADMIN), ListingController.deleteListing);
 



export const ListingRouter = router;