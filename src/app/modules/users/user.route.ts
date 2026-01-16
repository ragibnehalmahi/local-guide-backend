import express from "express";
import { UserControllers } from "./user.controller";
 
import { UserRole } from "./user.interface";
 
import { CreateUserSchema, UpdateUserSchema } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authGuard } from "../../middlewares/authGuard";

const router = express.Router();

// Public routes
router.get("/me", authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), UserControllers.getMyProfile);

router.post("/register", validateRequest(CreateUserSchema), UserControllers.createUser);
router.get("/guides", UserControllers.getAllGuides);
router.get("/:id", UserControllers.getUserById);

// Protected routes (all authenticated users)
router.get(
  "/me",
  authGuard(UserRole.ADMIN, UserRole.TOURIST, UserRole.GUIDE),
  UserControllers.getMyProfile
);

// Tourist only routes
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

// User update (self or admin)
router.patch(
  "/update-profile",
   authGuard(UserRole.ADMIN, UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(UpdateUserSchema),
  UserControllers.updateUser
);
 
// Admin only routes
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
router.get(
  '/listings',
  authGuard(UserRole.ADMIN),
  UserControllers.getAllListings
);
export const UserRouter = router;



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
