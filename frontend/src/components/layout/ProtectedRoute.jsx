import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { Spinner } from "../common/Spinner.jsx";
import { DASHBOARD_PATH_BY_ROLE } from "../../utils/constants.js";

/**
 * Gates a route tree behind authentication and, optionally, a specific
 * role. This is a UX convenience, not the real security boundary - the
 * backend enforces authorization independently on every request (see
 * Phase 2's authenticate/authorizeRoles middleware) regardless of what
 * this component does. This component just avoids showing a student a
 * TPO page before their API calls inevitably fail.
 *
 * A logged-in user hitting a route that isn't theirs is redirected to
 * THEIR OWN dashboard, not a dead-end error page - they didn't do
 * anything wrong, they just followed an old link or typed a URL.
 */
export function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_PATH_BY_ROLE[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}
