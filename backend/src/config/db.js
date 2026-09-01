import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
