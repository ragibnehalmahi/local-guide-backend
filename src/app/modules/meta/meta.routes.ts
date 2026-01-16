import express from "express";
import { MetaController } from "./meta.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../users/user.interface";

const router = express.Router();

router.get("/", authGuard(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), MetaController.getDashboardStats);

export const MetaRouter = router;