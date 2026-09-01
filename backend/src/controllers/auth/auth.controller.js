import { env } from "../../config/env.js";
import { authService } from "../../services/auth/auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";

/**
 * Cookie options shared by login/register (to set the cookie) and
 * logout (to clear it with matching options — browsers require matching
 * path/domain/sameSite/secure attributes to actually clear a cookie).
 *
 * WHAT: httpOnly means client-side JavaScript cannot read this cookie
 *       (document.cookie won't show it), which blocks a whole class of
 *       XSS-based token theft.
 * WHY secure only in production: `secure: true` requires HTTPS. Local
 *      dev over plain http://localhost would silently fail to set the
 *      cookie if this were always true.
 * WHY sameSite "lax": allows the cookie on normal top-level navigation
 *      and same-site requests while blocking most cross-site request
 *      forgery vectors, without needing "none" (which requires secure).
 */
function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches default JWT_EXPIRES_IN
  };
}

/**
 * Cookie options for CLEARING the cookie on logout.
 * WHY separate from getCookieOptions(): res.clearCookie must be called
 * with the same httpOnly/secure/sameSite/path attributes the cookie was
 * originally set with, or the browser won't recognize it as the same
 * cookie and won't remove it. It must NOT include maxAge/expires —
 * passing maxAge here is deprecated in Express and, worse, was found in
 * testing to set the cookie to expire 7 days in the future instead of
 * immediately, silently breaking logout.
 */
function getClearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, studentDetails } = req.body;

  const { user, token } = await authService.registerUser({
    name,
    email,
    password,
    role,
    studentDetails,
  });

  res.cookie("token", token, getCookieOptions());
  sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful",
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser({ email, password });

  res.cookie("token", token, getCookieOptions());
  sendSuccess(res, {
    message: "Login successful",
    data: { user },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", getClearCookieOptions());
  sendSuccess(res, { message: "Logout successful" });
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the `authenticate` middleware.
  sendSuccess(res, {
    message: "Current user fetched successfully",
    data: { user: authService.toSafeUser(req.user) },
  });
});
