"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router();
// Login
router.post("/login", auth_controller_1.AuthController.credentialsLogin);
// Refresh token
router.post("/refresh-token", auth_controller_1.AuthController.refreshToken);
// Logout
router.post("/logout", auth_controller_1.AuthController.logout);
// Reset password (only logged-in users)
router.post("/change-password", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.TOURIST), auth_controller_1.AuthController.changePassword);
exports.AuthRoutes = router;
