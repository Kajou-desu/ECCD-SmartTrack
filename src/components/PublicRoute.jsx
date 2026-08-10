import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const isParent = user?.role === "Parent" || user?.role === "Guardian";

  return (
    <Navigate to={isParent ? "/parent/dashboard" : "/dashboard"} replace />
  );
}
