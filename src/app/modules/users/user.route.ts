// src/app/modules/users/user.route.ts
import express from "express";
import { UserRole } from "./user.interface";
import { CreateUserSchema, UpdateUserSchema } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authGuard } from "../../middlewares/authGuard";
import { UserControllers } from "./user.controller";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.post("/register", validateRequest(CreateUserSchema), UserControllers.createUser);
router.get("/guides", UserControllers.getAllGuides);

// ============ PROTECTED ROUTES ============

// My profile routes (specific routes FIRST)
router.get(
  "/me",
  authGuard(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN),
  UserControllers.getMyProfile
);

router.patch(
  "/me",
  authGuard(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN),
  multerUpload.single("profilePicture"),
  validateRequest(UpdateUserSchema),
  UserControllers.updateMyProfile
);

// User by ID routes (dynamic routes AFTER)
router.get("/:id", UserControllers.getUserById);

router.patch(
  "/:id",
  authGuard(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN),
  validateRequest(UpdateUserSchema),
  UserControllers.updateUser
);

// Wishlist routes
router.post(
  "/wishlist",
  authGuard(UserRole.TOURIST),
  UserControllers.addToWishlist
);

router.delete(
  "/wishlist/:tourId",
  authGuard(UserRole.TOURIST),
  UserControllers.removeFromWishlist
);

// ============ ADMIN ONLY ROUTES ============
router.get(
  "/",
  authGuard(UserRole.ADMIN),
  UserControllers.getAllUsers
);

router.patch(
  "/:id/status",
  authGuard(UserRole.ADMIN),
  UserControllers.updateUserStatus
);

router.get(
  "/search/email",
  authGuard(UserRole.ADMIN),
  UserControllers.searchUserByEmail
);

export const UserRouter = router;
