import { createContext, useCallback, useEffect, useState } from "react";
import { authService } from "../services/auth.service.js";

/**
 * AuthContext
 * WHAT: React Context holding the currently authenticated user.
 * WHY: The user's identity/role is needed all over the app (Navbar,
 *      Sidebar, ProtectedRoute, every dashboard) — passing it down as
 *      props through every layout component would be tedious and
 *      brittle. This is the ONE piece of state promoted to Context, per
 *      the approved architecture; everything else stays local.
 * WHERE: Provided once at the top of the app (see main.jsx), consumed
 *        via the useAuth() hook (hooks/useAuth.js) anywhere it's needed.
 */
export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until the initial /auth/me check resolves

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // No valid session — this is an expected, normal state (e.g. a
      // fresh visitor who has never logged in), not an error to surface.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On first load, ask the backend "am I logged in?" via the HTTP-only
  // cookie, rather than trying to read any client-side token (there
  // isn't one to read — see Phase 2's cookie-only design).
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const registeredUser = await authService.register(payload);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
