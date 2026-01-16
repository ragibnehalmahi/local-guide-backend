import express from "express";
import { ReviewController } from "./review.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";
 
 
import validateRequest from "../../middlewares/validateRequest";
import { createReviewSchema } from "./reviews.validation";

const router = express.Router();

// Tourist only
router.post("/", authGuard(UserRole.TOURIST), validateRequest(createReviewSchema), ReviewController.createReview);

// Public
router.get("/:guideId", ReviewController.getReviewsForGuide);

export const ReviewRouter = router;