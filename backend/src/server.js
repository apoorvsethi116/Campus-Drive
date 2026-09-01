import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true, // required so the browser sends the HTTP-only auth cookie
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "CampusDrive AI backend is running", data: null });
});

app.use("/api", apiRoutes);

// Student, TPO, and Recruiter feature routes are added to routes/index.js
// in later phases. Only auth is wired as of Phase 2.

app.use(notFoundMiddleware);
app.use(errorMiddleware); // must be registered LAST

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] Listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start();
