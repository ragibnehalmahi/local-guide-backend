import express from "express";
import { AuthController } from "./auth.controller";
import  {authGuard } from "../../middlewares/authGuard";  
import { UserRole } from "../users/user.interface";  

const router = express.Router();

// Login
router.post("/login", AuthController.credentialsLogin);

// Refresh token
router.post("/refresh-token", AuthController.refreshToken);

// Logout
router.post("/logout", AuthController.logout);

// Reset password (only logged-in users)
router.post("/change-password", authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), AuthController.changePassword);

 

export const AuthRoutes = router;
