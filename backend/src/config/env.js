import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["MONGO_URI", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    // Fail fast and loudly rather than letting the app start in a broken state.
    throw new Error(
      `Missing required environment variable: ${key}. Copy backend/.env.example to backend/.env and fill it in.`
    );
  }
}

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};
