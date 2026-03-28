"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaRouter = void 0;
const express_1 = __importDefault(require("express"));
const meta_controller_1 = require("./meta.controller");
const authGuard_1 = require("../../middlewares/authGuard");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router();
router.get("/", (0, authGuard_1.authGuard)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.GUIDE, user_interface_1.UserRole.TOURIST), meta_controller_1.MetaController.getDashboardStats);
exports.MetaRouter = router;
