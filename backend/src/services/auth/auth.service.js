import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { User } from "../../models/User.model.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";
import { AppError } from "../../utils/AppError.js";

const SALT_ROUNDS = 10;

/**
 * JWT (JSON Web Token)
 * WHAT: A signed token encoding the user's id and role. "Signed" means
 *       the server can verify it hasn't been tampered with, using JWT_SECRET.
 * WHY: HTTP is stateless — without something like this, the server would
 *      have to look up a session on every request. A JWT lets the server
 *      verify identity from the token alone, without a session store.
 * WHERE: Signed at login, verified on every request by auth.middleware.js.
 */
function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Strips sensitive/internal fields before a user object is ever sent
 * back to the client in a JSON response.
 */
function toSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

/**
 * Registers a new user. If the role is STUDENT, also creates the
 * corresponding StudentProfile so a student never exists without one.
 */
async function registerUser({ name, email, password, role, studentDetails }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  if (role === "STUDENT") {
    // studentDetails is validated upstream by the register validator.
    await StudentProfile.create({
      user: user._id,
      branch: studentDetails.branch,
      currentCGPA: studentDetails.currentCGPA,
      activeBacklogs: studentDetails.activeBacklogs ?? 0,
      tenthPercentage: studentDetails.tenthPercentage,
      twelfthPercentage: studentDetails.twelfthPercentage,
      graduationYear: studentDetails.graduationYear,
    });
  }

  const token = signToken(user);
  return { user: toSafeUser(user), token };
}

/**
 * Verifies credentials and issues a token. Note: password must be
 * explicitly re-selected here because the schema marks it `select: false`.
 */
async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user);
  return { user: toSafeUser(user), token };
}

export const authService = {
  registerUser,
  loginUser,
  toSafeUser,
};
