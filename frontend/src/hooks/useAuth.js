import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Small wrapper around useContext so components import one thing
 * (useAuth) instead of importing both useContext and AuthContext
 * everywhere, and so a missing AuthProvider fails loudly instead of
 * silently returning undefined deep inside some component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
