// src/app/modules/reviews/review.routes.ts
import express from "express";
import { ReviewController } from "./review.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
import validateRequest from "../../middlewares/validateRequest";
import { createReviewSchema } from "./reviews.validation";

const router = express.Router();

// ============ TOURIST ROUTES ============
router.post(
  "/", 
  authGuard(UserRole.TOURIST), 
  validateRequest(createReviewSchema), 
  ReviewController.createReview
);

// ✅ Tourist's own reviews
router.get(
  "/my-reviews", 
  authGuard(UserRole.TOURIST), 
  ReviewController.getMyReviews
);

// ✅ Completed bookings for review (add this)
router.get(
  "/completed-bookings", 
  authGuard(UserRole.TOURIST), 
  ReviewController.getCompletedBookings
);

// ============ PUBLIC ROUTES ============
router.get("/:guideId", ReviewController.getReviewsForGuide);

export const ReviewRouter = router;



// import express from "express";
// import { ReviewController } from "./review.controller";
// import { authGuard } from "../../middlewares/authGuard";
// import { UserRole } from "../users/user.interface";


// import validateRequest from "../../middlewares/validateRequest";
// import { createReviewSchema } from "./reviews.validation";

// const router = express.Router();

// // Tourist only
// router.post("/", authGuard(UserRole.TOURIST), validateRequest(createReviewSchema), ReviewController.createReview);
// router.get("/my-reviews", authGuard(UserRole.TOURIST), ReviewController.getMyReviews);

// // Public
// router.get("/:guideId", ReviewController.getReviewsForGuide);

// export const ReviewRouter = router;
