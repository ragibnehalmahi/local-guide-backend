import { Response, NextFunction } from "express";
import { AuthenticatedRequest} from "./authGuard";  

export const roleGuard =
  (...allowedRoles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user && (req.user as any).role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You do not have permission.",
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Authorization failed!",
        error,
      });
    }
  };
