import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
// UserRole এবং UserStatus ধরে নেওয়া হলো এই পাথ থেকে আসছে
import { UserRole, UserStatus } from "../modules/users/user.interface";

// 1. AuthenticatedRequest টাইপ আপডেট করুন:
// 'email' প্রপার্টিটি যোগ করা হলো যা TypeScript এর টাইপিং কনফ্লিক্ট দূর করবে।
export type AuthenticatedRequest = Request & {
  user: { 
    _id: string; 
    email: string; // <-- এই প্রপার্টিটি যোগ করা হয়েছে
    role: UserRole; 
    status: UserStatus 
  };
};

export const authGuard =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Token নিন multiple sources থেকে
      let token = "";
      
      // Header থেকে (Postman এর জন্য)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        console.log("✅ Token from Authorization header");
      }
      
      // Cookie থেকে (Browser এর জন্য)
      else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
        console.log("✅ Token from cookie");
      }
      
      // Body থেকে (Alternative)
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

      // 2. Token verify করুন
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

      // 3. User ID extract করুন
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

      // **গুরুত্বপূর্ণ: email চেক করা হচ্ছে**
      if (!decoded.email) {
        console.error("❌ No email found in token");
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid token payload (no email)",
        });
      }
      
      // 4. req.user set করুন
      (req as AuthenticatedRequest).user = {
        _id: normalizedId,
        email: decoded.email, // <-- এখন email প্রপার্টি অ্যাসাইন করা হচ্ছে
        role: decoded.role as UserRole,
        status: (decoded.status as UserStatus) || UserStatus.ACTIVE,
      };

      console.log("✅ req.user set to:", (req as AuthenticatedRequest).user);

      // 5. Role checking
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


// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import config from "../config/config";

// export interface AuthUserPayload {
//   _id: string;
//   role: string;
//   email: string;
// }

// export interface AuthRequest extends Request {
//   user?: AuthUserPayload;
// }

// export const authGuard =
//   (...allowedRoles: string[]) =>
//   (req: AuthRequest, res: Response, next: NextFunction) => {
//     try {
//       const token = req.headers.authorization?.split(" ")[1];

//       if (!token) {
//         return res.status(401).json({
//           success: false,
//           message: "Unauthorized access! No token provided.",
//         });
//       }

//     const decoded = jwt.verify(
//   token,
//   process.env.JWT_ACCESS_SECRET as string
// ) as AuthUserPayload;


//       req.user = decoded; // attach user to request

//       // Role Checking
//       if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
//         return res.status(403).json({
//           success: false,
//           message: "Forbidden! You do not have permission to access this route.",
//         });
//       }

//       next();
//     } catch (error) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or expired token!",
//         error,
//       });
//     }
//   };
