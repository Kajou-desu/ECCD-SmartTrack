import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextObject";
import { setUnauthorizedHandler } from "@api/client";

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

          if (typeof storedToken === "string" && storedToken.trim() && parsedUser) {
            setToken(storedToken.trim());
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

  // Persist token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token.trim());
    } else {
      clearStoredAuth();
    }
  }, [token, clearStoredAuth]);

  // Persist user changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      clearStoredAuth();
    }
  }, [user, clearStoredAuth]);

  const login = useCallback((authToken, authUser) => {
    const sanitizedToken = typeof authToken === "string" ? authToken.trim() : "";

    if (!sanitizedToken) {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      return;
    }

    setToken(sanitizedToken);
    setUser(authUser);
  }, [clearStoredAuth]);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
