import { Navigate, Outlet } from "react-router-dom";

import Loader from "../components/ui/Loader/Loader.jsx";
import { useAuth } from "./AuthContext.jsx";
import { getDefaultAuthenticatedPath } from "./authRoutes.js";
import { ROUTE_AUTH_DISABLED_FOR_TESTS } from "./testAccess.js";

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <Loader
        variant="responsive"
        align="center"
        label="Verificando sesión"
        className="min-h-screen"
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
