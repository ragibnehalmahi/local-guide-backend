"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
// src/app/modules/users/user.route.ts
const express_1 = __importDefault(require("express"));
const user_interface_1 = require("./user.interface");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const authGuard_1 = require("../../middlewares/authGuard");
const user_controller_1 = require("./user.controller");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
// ============ PUBLIC ROUTES ============
router.post("/register", (0, validateRequest_1.default)(user_validation_1.CreateUserSchema), user_controller_1.UserControllers.createUser);
router.get("/guides", user_controller_1.UserControllers.getAllGuides);
// ============ PROTECTED ROUTES ============
// My profile routes (specific routes FIRST)
router.get("/me", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST, user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), user_controller_1.UserControllers.getMyProfile);
router.patch("/me", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST, user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), multer_config_1.multerUpload.single("profilePicture"), (0, validateRequest_1.default)(user_validation_1.UpdateUserSchema), user_controller_1.UserControllers.updateMyProfile);
// User by ID routes (dynamic routes AFTER)
router.get("/:id", user_controller_1.UserControllers.getUserById);
router.patch("/:id", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST, user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.ADMIN), (0, validateRequest_1.default)(user_validation_1.UpdateUserSchema), user_controller_1.UserControllers.updateUser);
// Wishlist routes
router.post("/wishlist", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), user_controller_1.UserControllers.addToWishlist);
router.delete("/wishlist/:tourId", (0, authGuard_1.authGuard)(user_interface_1.UserRole.TOURIST), user_controller_1.UserControllers.removeFromWishlist);
// ============ ADMIN ONLY ROUTES ============
router.get("/", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), user_controller_1.UserControllers.getAllUsers);
router.patch("/:id/status", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), user_controller_1.UserControllers.updateUserStatus);
router.get("/search/email", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN), user_controller_1.UserControllers.searchUserByEmail);
exports.UserRouter = router;
