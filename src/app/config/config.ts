import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",

  PORT: process.env.PORT || 5000,

  DB_URL: process.env.DATABASE_URL as string,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS
    ? Number(process.env.BCRYPT_SALT_ROUNDS)
    : 10,

  jwt_secret: process.env.JWT_SECRET || "default_jwt_secret",
  jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d",

  refresh_token_secret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  refresh_token_expires: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

   
};

export default config;
