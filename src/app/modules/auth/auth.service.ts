// src/app/modules/auth/auth.service.ts

import bcrypt from "bcryptjs";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { Schema, model } from "mongoose";
import AppError from "../../utils/AppError";  
import { User } from "../users/user.model";  
import { IUser, UserStatus } from  "../users/user.interface";

// Helper: JWT generator
const generateToken = (payload: object, secret: string, expiresIn: string | number): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

// ------------------ LOGIN FUNCTION ------------------
const credentialsLogin = async (payload: Partial<IUser> | undefined | null) => {
  console.log("🔑 Service: Received payload:", payload);

  // Robust check for valid payload object
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid request payload. Ensure email and password are provided in JSON body."
    );
  }

  if (!payload.email || !payload.password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required.");
  }

  // Safely access email and password
  const { email, password } = payload;

  // 1. Find user and explicitly select the password field
  // We are removing .lean() here, as .toObject() is used later to remove the password.
  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser) {
    // Security best practice: use a generic error message
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid email or password"); 
  }
  
  // Check user status (Re-added for security based on previous discussion)
  if (existingUser.status !== UserStatus.ACTIVE) {
    console.log(`❌ Account not active: ${existingUser.status}`);
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your account is ${existingUser.status}. Please contact administrator.`
    );
  }

  if (!existingUser.password) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "User password not found");
  }

  // Password comparison
  const isPasswordMatched = await bcrypt.compare(
    (password as string).trim(), // FIX: Add .trim() for comparison safety and robustness
    existingUser.password as string
  );
  
  if (!isPasswordMatched) {
    // Security best practice: use a generic error message
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid email or password"); 
  }
  
  console.log(`🎉 Login successful for: ${email}`);

  const jwtPayload = {
    userId: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
  };

  // FIX: Re-adding critical environment variable checks before token generation
  // This is crucial for preventing 'invalid signature' errors caused by missing secrets.
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error("❌ JWT secrets not configured");
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Server configuration error: JWT secrets missing."
    );
  }

  const accessToken = generateToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    (process.env.JWT_ACCESS_EXPIRES || "1h") as string // Use value from .env, default to '1h'
  );

  const refreshToken = generateToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    (process.env.JWT_REFRESH_EXPIRES || "7d") as string // Use value from .env, default to '7d'
  );

  // Use toObject() to ensure password field is removed from the response
  const { password: pass, ...rest } = existingUser.toObject();

  return {
    accessToken,
    refreshToken,
    user: rest,
  };
};

// ------------------ REFRESH TOKEN FUNCTION ------------------
const getNewAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST,"Refresh token is required", );
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.userId).select("+status +role +email");
    if (!user) throw new AppError(httpStatus.NOT_FOUND,"User not found", );

    if (
      user.status === UserStatus.BLOCKED ||
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.INACTIVE
    ) {
      throw new AppError(httpStatus.FORBIDDEN,"User is blocked, deleted or inactive", );
    }

    const newAccessToken = generateToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET as string,
      process.env.JWT_ACCESS_EXPIRES || "1h"
    );

    return {
      user,
      accessToken: newAccessToken,
      refreshToken,
    };
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED,"Invalid refresh token", );
  }
};

// ------------------ PASSWORD CHANGE FUNCTION ------------------
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError(httpStatus.NOT_FOUND,"User not found", );

  if (
    user.status === UserStatus.BLOCKED ||
    user.status === UserStatus.DELETED ||
    user.status === UserStatus.INACTIVE
  ) {
    throw new AppError(httpStatus.FORBIDDEN,"User is blocked, deleted or inactive", );
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password as string);
  if (!isOldPasswordValid) throw new AppError(httpStatus.UNAUTHORIZED,"Old password incorrect", );

  const isSame = await bcrypt.compare(newPassword, user.password as string);
  if (isSame) throw new AppError(httpStatus.BAD_REQUEST,"New password cannot be same as old", );

  user.password = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 12
  );
  await user.save();

  return { message: "Password reset successful" };
};

// ------------------ TOKEN MODEL ------------------
const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const TokenModel = model("Token", tokenSchema);

// ------------------ UPDATED LOGOUT FUNCTION ------------------
// const logout = async (refreshToken: string) => {
//   if (!refreshToken) {
//     throw new AppError("No refresh token provided", httpStatus.BAD_REQUEST);
//   }

//   // ✅ Remove the token from DB
//   const deleted = await TokenModel.findOneAndDelete({ token: refreshToken });
//   if (!deleted) {
//     throw new AppError("Invalid or already expired token", httpStatus.NOT_FOUND);
//   }

//   console.log("✅ Token removed successfully from DB");

//   return { message: "Logout successful" };
// };

// ------------------ EXPORT ------------------
export const AuthService = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  // logout,
};


