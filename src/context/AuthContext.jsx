import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextObject";
import { apiClient, setUnauthorizedHandler } from "@api/client";

// The sign-in token lives in an httpOnly cookie set by the API, so script can
// never read it. Only the non-secret display profile is kept here, as a hint
// to render the signed-in UI without a flash; the server stays the authority:
// if the cookie has expired, the first API call returns 401 and signs us out.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem("authToken"); // legacy: tokens used to be stored here
    localStorage.removeItem("authUser");
  }, []);

  useEffect(() => {
    const restore = () => {
      try {
        // Sessions from before the cookie change stored a token here; drop it
        // so a leftover credential doesn't linger in the browser.
        localStorage.removeItem("authToken");
        const storedUser = localStorage.getItem("authUser");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else if (storedUser) {
          clearStoredAuth();
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        clearStoredAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, [clearStoredAuth]);

  // Only ever write here (never clear): clearing on a null initial state wiped
  // a valid stored session before it could be restored. logout() clears.
  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    }
  }, [user]);

  const login = useCallback((authUser) => {
    if (!authUser || typeof authUser !== "object") {
      clearStoredAuth();
      setUser(null);
      return;
    }
    localStorage.setItem("authUser", JSON.stringify(authUser));
    setUser(authUser);
  }, [clearStoredAuth]);

  // Merges fields into the current session's user object — for self-service
  // profile edits (name/email/phone), where the account isn't changing,
  // just some of its display fields.
  const updateUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredAuth();
    // Ask the server to clear the cookie; signing out here never waits on it.
    apiClient.logout().catch(() => {});
  }, [clearStoredAuth]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
