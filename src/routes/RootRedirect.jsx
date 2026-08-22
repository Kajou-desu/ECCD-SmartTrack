import { Navigate } from "react-router-dom";
import { isParent } from "@auth/permissions.js";
import { useAuth } from "@hooks/useAuth.js";
import RouteSpinner from "@components/shared/RouteSpinner.jsx";

export default function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <RouteSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isParent(user?.role)) {
    return <Navigate to="/parent/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
