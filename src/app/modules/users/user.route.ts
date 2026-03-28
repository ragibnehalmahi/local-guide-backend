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
