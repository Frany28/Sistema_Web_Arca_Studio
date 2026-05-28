import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getDefaultAuthenticatedPath, useAuth } from "./AuthContext.jsx";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          authToast: {
            description: "Inicia sesiÃ³n para continuar.",
            icon: "lock",
            id: Date.now(),
            title: "Acceso protegido",
          },
          from: location,
        }}
      />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
