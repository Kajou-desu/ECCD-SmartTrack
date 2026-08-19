import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContextObject";
import { setUnauthorizedHandler } from "@api/client";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        // Clear invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  // Persist token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  // Persist user changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  const login = useCallback((authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

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
