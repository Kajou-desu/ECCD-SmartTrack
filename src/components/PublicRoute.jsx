import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isParent } from "../auth/permissions";

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <Navigate to={isParent ? "/parent/dashboard" : "/dashboard"} replace />
  );
}
