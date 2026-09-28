import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextObject";
import { setUnauthorizedHandler } from "@api/client";

// A malformed or missing exp claim is treated as expired (fail closed).
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const trimmedToken = typeof storedToken === "string" ? storedToken.trim() : "";

          if (trimmedToken && parsedUser && !isTokenExpired(trimmedToken)) {
            setToken(trimmedToken);
            setUser(parsedUser);
          } else {
            clearStoredAuth();
          }
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        clearStoredAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearStoredAuth]);

  // The token is written to localStorage synchronously in login() and
  // updateToken(), NOT in an effect: the API client reads it from storage, and
  // child effects (e.g. the notifications query) run before this provider's
  // effects, so an effect-based write let the first request after login go out
  // without an Authorization header -> 401 -> instant sign-out.
  // Only ever write here (never clear): clearing on a null initial state wiped
  // a valid stored session before it could be restored. logout() clears.
  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    }
  }, [user]);

  const login = useCallback((authToken, authUser) => {
    const sanitizedToken = typeof authToken === "string" ? authToken.trim() : "";

    if (!sanitizedToken) {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      return;
    }

    localStorage.setItem("authToken", sanitizedToken);
    localStorage.setItem("authUser", JSON.stringify(authUser));
    setToken(sanitizedToken);
    setUser(authUser);
  }, [clearStoredAuth]);

  // Merges fields into the current session's user object — for self-service
  // profile edits (name/email/phone), where the account isn't changing,
  // just some of its display fields.
  const updateUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  // Swaps in a fresh token without touching the stored user — for the
  // self-service password-change flow, which issues a new token (its
  // tokenVersion bump would otherwise sign this very session out too).
  const updateToken = useCallback((newToken) => {
    const sanitizedToken = typeof newToken === "string" ? newToken.trim() : "";
    if (!sanitizedToken) return;
    localStorage.setItem("authToken", sanitizedToken);
    setToken(sanitizedToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
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
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser,
    updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
