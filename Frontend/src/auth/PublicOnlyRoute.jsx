import { Navigate, Outlet } from "react-router-dom";

import { getDefaultAuthenticatedPath, useAuth } from "./AuthContext.jsx";
import { ROUTE_AUTH_DISABLED_FOR_TESTS } from "./testAccess.js";

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
    return <Outlet />;
  }

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
