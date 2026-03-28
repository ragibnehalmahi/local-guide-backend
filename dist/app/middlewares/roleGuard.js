"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const roleGuard = (...allowedRoles) => (req, res, next) => {
    try {
        const userRole = req.user && req.user.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden! You do not have permission.",
            });
        }
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: "Authorization failed!",
            error,
        });
    }
};
exports.roleGuard = roleGuard;
