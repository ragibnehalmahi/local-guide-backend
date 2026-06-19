//local-guide-backend\src\app\modules\auth\auth.controller.ts 

import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import AppError from "../../utils/AppError";
import { createUserTokens } from "../../utils/userToken";

// Cookie helper
interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

// ✅ Set cookies after login
const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
};

// ✅ Clear cookies after logout
const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

// ✅ Login Controller
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log("🎯 Controller: req.body:", req.body);

  if (!req.body?.email || !req.body?.password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required",);
  }

  const loginInfo = await AuthService.credentialsLogin(req.body);

  // Create tokens and set cookies
  const userTokens = createUserTokens(loginInfo.user);
  setAuthCookie(res, userTokens);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged In Successfully",
    data: loginInfo,
  });
});


const refreshToken = catchAsync(async (req: Request, res: Response) => {

  const token = req.cookies?.refreshToken || req.body?.refreshToken;


  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token not found in cookies or body!");
  }

  const result = await AuthService.getNewAccessToken(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});
// ✅ Change Password Controller
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const authUser = req.user as { _id: string; email: string; role: string };

  const result = await AuthService.changePassword(authUser._id, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful",
    data: result,
  });
});



const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  })
})
export const AuthController = {
  credentialsLogin,
  refreshToken,
  changePassword,
  logout
};

