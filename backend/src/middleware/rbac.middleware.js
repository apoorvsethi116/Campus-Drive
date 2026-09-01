import { AppError } from "../utils/AppError.js";

/**
 * authorizeRoles(...allowedRoles)
 * WHAT: A factory function — you call it with the roles allowed for a
 *       route, and it returns the actual middleware function. This works
 *       because of closures: the returned function "remembers"
 *       allowedRoles even after authorizeRoles() itself has returned.
 * WHY: Every protected endpoint must verify the user's role on the
 *      backend — the frontend hiding a button is not real security.
 * WHERE: Applied after `authenticate` on every role-specific route, e.g.
 *        router.post("/drives", authenticate, authorizeRoles("TPO"), ...)
 *
 * This intentionally stays a single small function — no roles/permissions
 * database table, no policy engine. Three roles, checked with .includes().
 */
export function authorizeRoles(...allowedRoles) {
  return function roleCheckMiddleware(req, res, next) {
    if (!req.user) {
      // Should never happen if `authenticate` ran first, but fail safely.
      throw new AppError("You must be logged in to access this resource", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    next();
  };
}
