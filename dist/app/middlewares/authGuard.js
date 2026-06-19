"use strict";
//local-guide-backend\src\app\middlewares\authGuard.ts    
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const user_interface_1 = require("../modules/users/user.interface");
const authGuard = (...allowedRoles) => (req, res, next) => {
    try {
        let token = "";
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
            console.log("✅ Token from Authorization header");
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
            console.log("✅ Token from cookie");
        }
        else if (req.body?.accessToken) {
            token = req.body.accessToken;
            console.log("✅ Token from body");
        }
        console.log("🔹 Token found:", token ? "YES" : "NO");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Missing or invalid token",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        console.log("✅ Token decoded:", {
            hasUserId: !!decoded.userId,
            has_id: !!decoded._id,
            hasId: !!decoded.id,
            role: decoded.role,
            email: decoded.email
        });
        const normalizedId = decoded._id || decoded.userId || decoded.id;
        if (!normalizedId) {
            console.error("❌ No user ID found in token");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload (no user ID)",
            });
        }
        if (!decoded.role) {
            console.error("❌ No role found in token");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload (no role)",
            });
        }
        if (!decoded.email) {
            console.error("❌ No email found in token");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload (no email)",
            });
        }
        req.user = {
            _id: normalizedId,
            email: decoded.email,
            role: decoded.role,
            status: decoded.status || user_interface_1.UserStatus.ACTIVE,
        };
        console.log("✅ req.user set to:", req.user);
        if (allowedRoles.length > 0) {
            const userRole = req.user.role;
            if (!allowedRoles.includes(userRole)) {
                console.log(`❌ Role ${userRole} not in allowed roles:`, allowedRoles);
                return res.status(403).json({
                    success: false,
                    message: `Forbidden: Role ${userRole} not allowed`,
                });
            }
        }
        next();
    }
    catch (error) {
        console.error("❌ Auth middleware error:", error);
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token expired",
            });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.authGuard = authGuard;
