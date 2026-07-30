import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";
import { getDefaultAuthenticatedPath } from "./authRoutes.js";
import { ROUTE_AUTH_DISABLED_FOR_TESTS } from "./testAccess.js";
import SessionUnavailable from "./SessionUnavailable.jsx";

function PublicOnlyRoute() {
  const {
    isAuthenticated,
    isLoading,
    isSessionUnavailable,
    restoreSession,
    user,
  } = useAuth();

  if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
    return <Outlet />;
  }

  if (isLoading) {
    return null;
  }

  if (isSessionUnavailable) {
    return <SessionUnavailable onRetry={restoreSession} />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
