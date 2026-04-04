"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRouter = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const reviews_validation_1 = require("./reviews.validation");
const router = express_1.default.Router();
// ============ PUBLIC ROUTES ============
// ✅ Get reviews for a specific guide
router.get("/:guideId", review_controller_1.ReviewController.getReviewsForGuide);
// ============ TOURIST ROUTES ============
// ✅ Create a review (Tourist only)
router.post("/", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), (0, validateRequest_1.default)(reviews_validation_1.createReviewSchema), review_controller_1.ReviewController.createReview);
// ✅ Get current tourist's own reviews
router.get("/tourist/my-reviews", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), review_controller_1.ReviewController.getMyReviews);
// ✅ Get completed bookings that can be reviewed
router.get("/tourist/completed-bookings", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), review_controller_1.ReviewController.getCompletedBookings);
// ============ ADMIN ROUTES (Optional) ============
// ✅ Update review (Admin only)
router.patch("/:reviewId", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), review_controller_1.ReviewController.updateReview);
// ✅ Delete review (Admin only)
router.delete("/:reviewId", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), review_controller_1.ReviewController.deleteReview);
exports.ReviewRouter = router;
