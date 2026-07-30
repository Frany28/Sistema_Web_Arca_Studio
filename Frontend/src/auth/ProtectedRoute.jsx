import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";
import { getDefaultAuthenticatedPath } from "./authRoutes.js";
import { ROUTE_AUTH_DISABLED_FOR_TESTS } from "./testAccess.js";
import SessionUnavailable from "./SessionUnavailable.jsx";
import { getProtectedRouteDecision } from "./authRouteState.js";

function ProtectedRoute({ allowedRoles }) {
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

  const decision = getProtectedRouteDecision({
    allowedRoles,
    isAuthenticated,
    isLoading,
    isSessionUnavailable,
    role: user?.role,
  });

  if (decision === "loading") {
    return null;
  }

  if (decision === "unavailable") {
    return <SessionUnavailable onRetry={restoreSession} />;
  }

  if (decision === "login") {
    return <Navigate to="/" replace />;
  }

  if (decision === "role-home") {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
