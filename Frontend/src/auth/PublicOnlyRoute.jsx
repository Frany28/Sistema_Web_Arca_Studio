import { Navigate, Outlet } from "react-router-dom";

import { getDefaultAuthenticatedPath, useAuth } from "./AuthContext.jsx";

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
