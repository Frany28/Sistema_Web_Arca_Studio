import { Navigate, Outlet } from "react-router-dom";

import { getDefaultAuthenticatedPath, useAuth } from "./AuthContext.jsx";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
