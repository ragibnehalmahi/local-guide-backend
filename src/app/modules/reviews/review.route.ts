import express from "express";
import { ReviewController } from "./review.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
 
 
import validateRequest from "../../middlewares/validateRequest";
import { createReviewSchema } from "./reviews.validation";

const router = express.Router();

// ============ PUBLIC ROUTES ============
// ✅ Get reviews for a specific guide
router.get("/:guideId", ReviewController.getReviewsForGuide);

// ============ TOURIST ROUTES ============
// ✅ Create a review (Tourist only)
router.post(
  "/", 
  authGuard(UserRole.TOURIST), 
  validateRequest(createReviewSchema), 
  ReviewController.createReview
);

// ✅ Get current tourist's own reviews
router.get(
  "/tourist/my-reviews", 
  authGuard(UserRole.TOURIST), 
  ReviewController.getMyReviews
);

// ✅ Get completed bookings that can be reviewed
router.get(
  "/tourist/completed-bookings", 
  authGuard(UserRole.TOURIST), 
  ReviewController.getCompletedBookings
);

// ============ ADMIN ROUTES (Optional) ============
// ✅ Update review (Admin only)
router.patch(
  "/:reviewId",
  authGuard(UserRole.ADMIN),
  ReviewController.updateReview
);

// ✅ Delete review (Admin only)
router.delete(
  "/:reviewId",
  authGuard(UserRole.ADMIN),
  ReviewController.deleteReview
);

export const ReviewRouter = router;