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
// Tourist only
router.post("/", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), (0, validateRequest_1.default)(reviews_validation_1.createReviewSchema), review_controller_1.ReviewController.createReview);
router.get("/my-reviews", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), review_controller_1.ReviewController.getMyReviews);
// Public
router.get("/:guideId", review_controller_1.ReviewController.getReviewsForGuide);
exports.ReviewRouter = router;
