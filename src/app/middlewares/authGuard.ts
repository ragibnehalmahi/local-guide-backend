//local-guide-backend\src\app\middlewares\authGuard.ts    


import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

import { UserRole, UserStatus } from "../modules/users/user.interface";


export type AuthenticatedRequest = Request & {
  user: {
    _id: string;
    email: string;
    role: UserRole;
    status: UserStatus
  };
};

export const authGuard =
  (...allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
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


        const decoded = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET as string
        ) as JwtPayload & {
          _id?: string;
          userId?: string;
          id?: string;
          role?: UserRole;
          status?: UserStatus;
          email?: string;
        };

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


        (req as AuthenticatedRequest).user = {
          _id: normalizedId,
          email: decoded.email,
          role: decoded.role as UserRole,
          status: (decoded.status as UserStatus) || UserStatus.ACTIVE,
        };

        console.log("✅ req.user set to:", (req as AuthenticatedRequest).user);


        if (allowedRoles.length > 0) {
          const userRole = (req as AuthenticatedRequest).user.role;

          if (!allowedRoles.includes(userRole)) {
            console.log(`❌ Role ${userRole} not in allowed roles:`, allowedRoles);
            return res.status(403).json({
              success: false,
              message: `Forbidden: Role ${userRole} not allowed`,
            });
          }
        }

        next();
      } catch (error) {
        console.error("❌ Auth middleware error:", error);

        if (error instanceof TokenExpiredError) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: Token expired",
          });
        }

        if (error instanceof jwt.JsonWebTokenError) {
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

