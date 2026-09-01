import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.model.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * authenticate
 * WHAT: Express middleware that reads the JWT from the HTTP-only cookie,
 *       verifies its signature, loads the corresponding user, and attaches
 *       it to req.user for downstream handlers.
 * WHY: Every protected route needs to know "who is making this request"
 *      before it can decide what they're allowed to do.
 * WHERE: Applied to every route under /api/student, /api/tpo,
 *        /api/recruiter, and to GET /api/auth/me.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("You must be logged in to access this resource", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new AppError("Invalid or expired session. Please log in again.", 401);
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError("The account for this session no longer exists", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  req.user = user;
  next();
});
