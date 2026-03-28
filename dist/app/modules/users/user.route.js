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
// // src/app/modules/users/user.route.ts
// import express from "express";
// import { UserRole } from "./user.interface";
// import { CreateUserSchema, UpdateUserSchema } from "./user.validation";
// import validateRequest from "../../middlewares/validateRequest";
// import { authGuard } from "../../middlewares/authGuard";
// import { UserControllers } from "./user.controller";
// const router = express.Router();
// // ============ PUBLIC ROUTES ============
// router.post("/register", validateRequest(CreateUserSchema), UserControllers.createUser);
// router.get("/guides", UserControllers.getAllGuides);
// // ============ PROTECTED ROUTES ============
// // ⚠️ IMPORTANT: Specific routes আগে, dynamic routes পরে
// // "me" route আগে দিতে হবে, কারণ এটি "/:id" এর চেয়ে specific
// // Get my profile - SPECIFIC ROUTE (আগে)
// router.get(
//   "/me",
//   authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
//   UserControllers.getMyProfile
// );
// // Update my profile (self update)
// router.patch(
//   "/me",
//   authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
//   validateRequest(UpdateUserSchema),
//   UserControllers.updateUser
// );
// // Get user by ID - DYNAMIC ROUTE (পরে)
// router.get("/:id", UserControllers.getUserById);
// // Update user by ID (Admin or self)
// router.patch(
//   "/:id",
//   authGuard(UserRole.ADMIN, UserRole.TOURIST, UserRole.GUIDE, UserRole.SUPER_ADMIN),
//   validateRequest(UpdateUserSchema),
//   UserControllers.updateUser
// );
// // Tourist only routes
// router.post(
//   "/wishlist",
//   authGuard(UserRole.TOURIST),
//   UserControllers.addToWishlist
// );
// router.delete(
//   "/wishlist/:tourId",
//   authGuard(UserRole.TOURIST),
//   UserControllers.removeFromWishlist
// );
// // ============ ADMIN ONLY ROUTES ============
// router.get(
//   "/",
//   authGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   UserControllers.getAllUsers
// );
// router.patch(
//   "/:id/status",
//   authGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   UserControllers.updateUserStatus
// );
// router.get(
//   "/search/email",
//   authGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   UserControllers.searchUserByEmail
// );
// router.get(
//   '/listings',
//   authGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   UserControllers.getAllListings
// );
// export const UserRouter = router;
// import express from "express";
// import { UserRole } from "./user.interface";
// import { CreateUserSchema, UpdateUserSchema } from "./user.validation";
// import validateRequest from "../../middlewares/validateRequest";
// import { authGuard } from "../../middlewares/authGuard";
// import { uploadToCloudinary } from "../../../cloudinary";
// import { UserControllers } from "./user.controller";
// const router = express.Router();
// // Public routes
// router.get("/me", authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), UserControllers.getMyProfile);
// router.post("/register", validateRequest(CreateUserSchema), UserControllers.createUser);
// router.get("/guides", UserControllers.getAllGuides);
// router.get("/:id", UserControllers.getUserById);
// // Protected routes (all authenticated users)
// router.get(
//   "/me",
//   authGuard(UserRole.ADMIN, UserRole.TOURIST, UserRole.GUIDE),
//   UserControllers.getMyProfile
// );
// // Tourist only routes
// router.post(
//   "/wishlist",
//   authGuard(UserRole.TOURIST),
//   UserControllers.addToWishlist
// );
// router.delete(
//   "/wishlist/:tourId",
//    authGuard(UserRole.TOURIST),
//   UserControllers.removeFromWishlist
// );
// // User update (self or admin)
// router.patch(
//   "/update-profile",
//   authGuard(UserRole.ADMIN, UserRole.TOURIST, UserRole.GUIDE),
//   validateRequest(UpdateUserSchema),
//   UserControllers.updateUser // এখানে req.user._id ব্যবহারের জন্য সার্ভিসে আইডি পাঠাতে হবে
// );
// //  router.patch('/me/update', authGuard(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN),   UserControllers.updateMyProfile);
// // Admin only routes
// router.get(
//   "/",
//    authGuard(UserRole.ADMIN),
//   UserControllers.getAllUsers
// );
// router.patch(
//   "/:id/status",
//    authGuard(UserRole.ADMIN),
//   UserControllers.updateUserStatus
// );
// router.get(
//   "/search/email",
//    authGuard(UserRole.ADMIN),
//   UserControllers.searchUserByEmail
// );
// router.get(
//   '/listings',
//   authGuard(UserRole.ADMIN),
//   UserControllers.getAllListings
// );
// export const UserRouter = router;
// import express from "express";
// import { UserControllers } from "./user.controller";
// import { authGuard } from "../../middlewares/authGuard";  
// import { UserRole } from "./user.interface";
// const router = express.Router();
// router.post("/register", UserControllers.createUser);
// router.get(
//   "/all",
//   authGuard(UserRole.ADMIN),
//   UserControllers.getAllUsers
// );
// router.patch(
//   "/:id",
//   authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
//   UserControllers.updateUser
// );
// export const UserRouter = router;
